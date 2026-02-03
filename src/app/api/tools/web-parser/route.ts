import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { unifiedAi } from "@/lib/scrapers/ai-unified";
import { exec } from "child_process";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import ServiceSettings from "@/lib/models/ServiceSettings";
import { connectDB } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const ipAddress = req.headers.get("x-forwarded-for")?.split(',')[0] || req.ip || "127.0.0.1";

    // Check Rate Limit
    const rateLimit = await checkRateLimit(ipAddress, "web-parser");
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        status: false, 
        error: `Terlalu banyak request. Silakan tunggu ${rateLimit.waitSeconds} detik lagi.` 
      }, { status: 429 });
    }

    const settingsDoc = await ServiceSettings.findOne();
    if (settingsDoc && settingsDoc.webParser === false) {
      return NextResponse.json({ status: false, error: "Web Parser is currently disabled by admin." }, { status: 403 });
    }

    const { url, language, model, instructions } = await req.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ status: false, error: "URL tidak valid" }, { status: 400 });
    }

    // 1. Fetch Metadata & Content
    let metadata = { title: "", description: "", domain: "" };
    try {
      metadata.domain = new URL(url).hostname;
    } catch {
      return NextResponse.json({ status: false, error: "URL format error" });
    }

    let html = "";
    try {
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      html = response.data;
      const $ = cheerio.load(html);
      metadata.title = $("title").text().trim() || $("meta[property='og:title']").attr("content") || "";
      metadata.description = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "";
    } catch (error: any) {
      console.error("Metadata fetch error:", error.message);
      // Fallback: If metadata fetch fails, we still try to proceed if possible or error out
      if (!html) {
        return NextResponse.json({ status: false, error: "Gagal mengambil konten website: " + error.message });
      }
    }

    // 2. Prepare AI Prompt
    const cleanedHtml = html.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gmi, "")
                           .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gmi, "")
                           .replace(/<svg\b[^<]*>([\s\S]*?)<\/svg>/gmi, "")
                           .substring(0, 15000);

    const systemPrompt = `ROLE: You are a professional web parser & data extraction AI.
GOAL: Extract structured data from the given webpage content accurately and generate a RUNNABLE scraper script.

Target Language: ${language}
Libraries allowed:
- JavaScript: axios, cheerio (MUST use require for standard Node.js)
- Python: requests, beautifulsoup4 (bs4)
- PHP: curl, DOMDocument
- Go: net/http, colly (or standard lib)

IMPORTANT RULES:
1. Return ONLY valid JSON.
2. The JSON MUST follow this schema:
{
  "status": true,
  "metadata": { "title": "...", "domain": "..." },
  "extracted_data": {},
  "code": "FULL_SOURCE_CODE_HERE",
  "language": "${language}",
  "model": "${model}",
  "confidence": 0.95
}
3. The "code" part must be a complete, self-contained file that can be executed directly.
4. The code MUST print the extracted data as a JSON string to stdout.
5. Do NOT use fake placeholders for selectors. Analyze the HTML provided.
6. For Node.js, ensure you require('axios') and require('cheerio').`;

    const userPrompt = `URL: ${url}
Instructions: ${instructions || "Extract title, price, description and images if any."}
HTML Content:
${cleanedHtml}`;

    // 3. Retry Logic
    let retryCount = 0;
    const maxRetries = 3;
    let lastError = "";
    let finalResult = null;

    while (retryCount < maxRetries) {
      try {
        const aiResponse = await unifiedAi([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${userPrompt}\n\n${lastError ? `PREVIOUS TEST FAILED WITH ERROR: ${lastError}. PLEASE FIX THE CODE SELECTORS OR LOGIC.` : ''}` }
        ], model as any);

        if (!aiResponse) throw new Error("AI response empty");

        // Extract JSON from potential markdown blocks
        const jsonMatch = aiResponse.match(/(\{[\s\S]*\})/);
        if (!jsonMatch) throw new Error("AI did not return valid JSON block");
        
        const parsedResult = JSON.parse(jsonMatch[0]);

        if (!parsedResult.code) throw new Error("AI did not generate code");

        // 4. Auto-Test in Sandbox
        const testResult = await runAutoTest(parsedResult.code, language);

        if (testResult.success) {
          finalResult = {
            ...parsedResult,
            extracted_data: testResult.data,
            status: true,
            tested: true
          };
          break;
        } else {
          lastError = testResult.error;
          retryCount++;
        }
      } catch (e: any) {
        lastError = e.message;
        retryCount++;
      }
    }

    if (!finalResult) {
      return NextResponse.json({ 
        status: false, 
        error: "Auto test failed after 3 retries. Scraper logic could not be validated.",
        details: lastError
      });
    }

    return NextResponse.json(finalResult);

  } catch (error: any) {
    console.error("Web Parser Route Error:", error);
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const settings = await ServiceSettings.findOne();
    return NextResponse.json({ 
      success: true, 
      enabled: settings ? settings.webParser !== false : true 
    });
  } catch (error) {
    return NextResponse.json({ success: false, enabled: true });
  }
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function runAutoTest(code: string, language: string): Promise<{ success: boolean; data?: any; error?: any }> {
  const id = uuidv4();
  const langLower = language.toLowerCase();
  const ext = langLower === 'python' ? 'py' : 
              langLower === 'php' ? 'php' :
              langLower === 'go' ? 'go' : 'js';
  
  const tempDir = path.join(process.cwd(), "tmp", "parser-tests");
  if (!fs.existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true });
  }
  
  const filePath = path.join(tempDir, `${id}.${ext}`);

  try {
    await writeFile(filePath, code);

    let command = "";
    switch (langLower) {
      case 'python': command = `python3 ${filePath}`; break;
      case 'php': command = `php ${filePath}`; break;
      case 'go': command = `go run ${filePath}`; break;
      default: command = `node ${filePath}`; break;
    }

    return new Promise((resolve) => {
      exec(command, { timeout: 25000 }, (error, stdout, stderr) => {
        // Cleanup
        unlink(filePath).catch(() => {});

        if (error) {
          return resolve({ success: false, error: stderr || stdout || error.message });
        }

        try {
          const jsonMatch = stdout.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
          if (!jsonMatch) return resolve({ success: false, error: "Output did not contain valid JSON: " + stdout });
          
          const parsed = JSON.parse(jsonMatch[0]);
          const extractedData = Array.isArray(parsed) ? parsed : (parsed.extracted_data || parsed.data || parsed);
          
          resolve({ success: true, data: extractedData });
        } catch (e: any) {
          resolve({ success: false, error: "Failed to parse JSON output from scraper: " + stdout });
        }
      });
    });
  } catch (err: any) {
    return { success: false, error: "Sandbox execution error: " + err.message };
  }
}
