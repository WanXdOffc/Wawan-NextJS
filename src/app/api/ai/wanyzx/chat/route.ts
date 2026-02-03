import { NextRequest, NextResponse } from "next/server";
import { gemmy } from "@/lib/gemmy";
import { gemini } from "@/lib/gemini";
import { connectDB } from "@/lib/mongodb";
import WanyzxChatSession from "@/lib/models/WanyzxChatSession";
import WanyzxChatMessage from "@/lib/models/WanyzxChatMessage";
import ServiceSettings from "@/lib/models/ServiceSettings";
import { getWebsiteContext } from "@/lib/wanyzx-context";
import { v4 as uuidv4 } from "uuid";
import { scrapeGpt3 } from "@/lib/scrapers/gpt3";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const ipAddress = req.headers.get("x-forwarded-for")?.split(',')[0] || req.ip || "127.0.0.1";
    
    // Check Rate Limit
    const rateLimit = await checkRateLimit(ipAddress, "wanyzx-ai");
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        success: false, 
        error: `Terlalu banyak request. Silakan tunggu ${rateLimit.waitSeconds} detik lagi.` 
      }, { status: 429 });
    }

    // Check if feature is enabled
    const { 
      message = "", 
      sessionId: existingSessionId, 
      model: requestedModel = "Gemini Scraper", 
      type = "text", 
      media,
      settings = { language: 'en', verbosity: 'balanced', temperature: 0.7, topP: 0.9 }
    } = body;

    let model = requestedModel;
    const finalMessage = message || (media ? "[Media Attachment]" : "");

    // Automatic Model Orchestration
    const lowerMessage = message.toLowerCase();
    const isImageGeneration = /buat gambar|generate image|create image|draw|gambarin/i.test(lowerMessage);
    const hasMedia = !!media;
    const isFileReading = /baca file|read file|analisis file|cek file|baca gambar|lihat gambar/i.test(lowerMessage);
    const isCodingTask = /code|coding|programming|script|javascript|typescript|python|html|css|php|java|rust|golang|buatkan kode|bikin kode/i.test(lowerMessage);
    const isLongText = message.length > 1000;

    if (requestedModel === "Mode Auto") {
      if (isImageGeneration) {
        model = "Image";
      } else if (hasMedia || isFileReading) {
        model = "Gemmy";
      } else if (isCodingTask || isLongText) {
        model = "Claude";
      } else {
        model = "Gemini Scraper";
      }
    } else {
      model = requestedModel;
    }

    if (!finalMessage && !media) {
      return NextResponse.json({ success: false, error: "Message or media is required" }, { status: 400 });
    }

    const sessionId = existingSessionId || uuidv4();
    const websiteContext = await getWebsiteContext();

    const systemPrompt = `
${websiteContext}
Identity: You are "Wanyzx AI", an elite cognitive entity and the digital avatar of Wanyzx.
Personality: Intelligent, technical, visionary, and elegantly direct.
Represent Wanyzx's expertise in Full Stack Development, AI Engineering, and Prompt Engineering.
Current Model: ${model}
Response Language: ${settings.language || 'auto'}
Temperature: ${settings.temperature || 0.7}
`;

    // Fetch history
    const historyDocs = await WanyzxChatMessage.find({ sessionId }).sort({ createdAt: 1 }).limit(10);
    const history = historyDocs.map(doc => ({
      role: doc.role === 'assistant' ? 'assistant' : 'user',
      content: doc.content
    }));

    let replyContent = "";
    let finalType = "text";

    // AI Orchestration Logic
    try {
      if (model === "Image") {
        const response = await gemmy.generateImage(finalMessage);
        if (response.success) {
          replyContent = response.url;
          finalType = "image";
        } else {
          throw new Error(response.msg || "Image generation failed");
        }
      } else if (model === "Gemmy" || hasMedia) {
        const gemmyHistory = historyDocs.map(doc => ({
          role: doc.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: doc.content || "[Media]" }]
        }));
        
        const response = await gemmy.chat(finalMessage, gemmyHistory, media);
        if (response.success) {
          replyContent = response.reply;
        } else {
          throw new Error(response.msg || "Gemmy failed to respond");
        }
      } else if (model === "Claude") {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/claude`, {
          prompt: `${systemPrompt}\n\nUser: ${finalMessage}`
        });
        replyContent = response.data.result;
      } else if (model === "GPT") {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/gpt3`, {
          prompt: `${systemPrompt}\n\nUser: ${finalMessage}`
        });
        replyContent = response.data.data;
      } else {
        // Default: Gemini Scraper
        const result = await gemini({ 
          message: finalMessage, 
          instruction: systemPrompt,
          sessionId: existingSessionId
        });
        replyContent = result.text;
      }
    } catch (err: any) {
      console.error("Model Error:", err);
      // Fallback to Gemini Scraper on error
      const result = await gemini({ 
        message: finalMessage, 
        instruction: systemPrompt,
        sessionId: existingSessionId
      });
      replyContent = result.text;
    }

    if (!replyContent) {
      throw new Error("Failed to generate response");
    }

    // Save Session
    await WanyzxChatSession.findOneAndUpdate(
      { sessionId },
      { 
        $set: { 
          lastMessage: finalType === 'image' ? 'Generated an image' : replyContent.substring(0, 100),
          title: existingSessionId ? undefined : finalMessage.substring(0, 30),
          ipAddress: ipAddress
        } 
      },
      { upsert: true, new: true }
    );

    // Save Messages
    await WanyzxChatMessage.create([
      { sessionId, role: 'user', content: finalMessage, type: media ? 'vision' : 'text', model },
      { sessionId, role: 'assistant', content: replyContent, type: finalType, model }
    ]);

    return NextResponse.json({
      success: true,
      sessionId,
      reply: replyContent,
      type: finalType
    });

  } catch (error: any) {
    console.error("Wanyzx AI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
