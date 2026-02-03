import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ServiceSettings from "@/lib/models/ServiceSettings";

export async function GET() {
  try {
    await connectDB();
    
    let settings = await ServiceSettings.findOne();
    if (!settings) {
      settings = await ServiceSettings.create({});
    }
    
    return NextResponse.json({
      success: true,
      services: {
        musicPlayer: settings.musicPlayer,
        library: settings.library,
        aiImage: settings.aiImage,
        tempMail: settings.tempMail,
        uploader: settings.uploader,
        wanyzxAi: settings.wanyzxAi,
        webParser: settings.webParser,
      }
    });
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json({ 
      success: true, 
      services: {
        musicPlayer: true,
        library: true,
        aiImage: true,
        tempMail: true,
        uploader: true,
        wanyzxAi: true,
        webParser: true,
      }
    });
  }
}
