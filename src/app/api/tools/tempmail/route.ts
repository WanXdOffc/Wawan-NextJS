import axios from "axios";
import { connectDB } from "@/lib/mongodb";
import TempMailSettings from "@/lib/models/TempMailSettings";
import TempMailUsage from "@/lib/models/TempMailUsage";
import TempMailSession from "@/lib/models/TempMailSession";
import ServiceSettings from "@/lib/models/ServiceSettings";
import { headers } from "next/headers";
import { apiResponse, apiError } from "@/lib/apiResponse";

const TEMPMAIL_HEADERS = {
  'User-Agent': 'ScRaPe/9.9 (KaliLinux; Nusantara Os; My/Shannz)',
  'Connection': 'Keep-Alive',
  'Accept-Encoding': 'gzip',
  'Content-Type': 'application/x-www-form-urlencoded',
};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

async function getClientIP() {
  const headersList = await headers();
  return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || headersList.get('x-real-ip') 
    || '127.0.0.1';
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const ip = await getClientIP();
    const today = getToday();

    const { forceNew } = await request.json().catch(() => ({ forceNew: false }));

    let serviceSettings = await ServiceSettings.findOne();
    if (!serviceSettings) {
      serviceSettings = await ServiceSettings.create({});
    }

    if (!serviceSettings.tempMail) {
      return apiError("TempMail service is currently disabled", 503);
    }

    let settings = await TempMailSettings.findOne();
    if (!settings) {
      settings = await TempMailSettings.create({ limitPerIpPerDay: 5, enabled: true });
    }

    const existingSession = await TempMailSession.findOne({ ip });
    
    if (existingSession && !forceNew) {
      const usage = await TempMailUsage.findOne({ ip, date: today });
      const used = usage?.count || 0;
      
      return apiResponse({ 
        success: true, 
        result: {
          data: {
            email: existingSession.email,
            email_token: existingSession.token,
          }
        },
        remaining: Math.max(0, settings.limitPerIpPerDay - used),
        isExisting: true,
        expiresAt: existingSession.expiresAt
      });
    }

    let usage = await TempMailUsage.findOne({ ip, date: today });
    if (!usage) {
      usage = await TempMailUsage.create({ ip, date: today, count: 0 });
    }

    if (usage.count >= settings.limitPerIpPerDay) {
      return apiError(
        `Daily limit reached (${settings.limitPerIpPerDay}/day). Try again tomorrow.`,
        429
      );
    }

    const response = await axios.post(
      'https://tempail.top/api/email/create/ApiTempail',
      '',
      { headers: TEMPMAIL_HEADERS, timeout: 10000 }
    );

    const emailData = response.data?.data || response.data;
    const email = emailData.email || emailData.address;
    const token = emailData.email_token || emailData.token;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await TempMailSession.findOneAndUpdate(
      { ip },
      { 
        ip,
        email,
        token,
        createdAt: new Date(),
        expiresAt
      },
      { upsert: true, new: true }
    );

    await TempMailUsage.updateOne(
      { ip, date: today },
      { $inc: { count: 1 } }
    );

    return apiResponse({ 
      success: true, 
      result: response.data,
      remaining: settings.limitPerIpPerDay - usage.count - 1,
      used: usage.count + 1,
      limit: settings.limitPerIpPerDay,
      isExisting: false,
      expiresAt
    });
  } catch (error) {
    console.error("TempMail create error:", error);
    return apiError("Failed to create temp email", 500);
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const ip = await getClientIP();
    const today = getToday();

    let serviceSettings = await ServiceSettings.findOne();
    if (!serviceSettings) {
      serviceSettings = await ServiceSettings.create({});
    }

    let settings = await TempMailSettings.findOne();
    if (!settings) {
      settings = await TempMailSettings.create({ limitPerIpPerDay: 5, enabled: true });
    }

    const usage = await TempMailUsage.findOne({ ip, date: today });
    const used = usage?.count || 0;

    const existingSession = await TempMailSession.findOne({ ip });

    return apiResponse({
      success: true,
      enabled: serviceSettings.tempMail,
      limit: settings.limitPerIpPerDay,
      used,
      remaining: Math.max(0, settings.limitPerIpPerDay - used),
      hasActiveSession: !!existingSession,
      session: existingSession ? {
        email: existingSession.email,
        token: existingSession.token,
        expiresAt: existingSession.expiresAt
      } : null
    });
  } catch (error) {
    console.error("TempMail status error:", error);
    return apiError("Failed to get status", 500);
  }
}
