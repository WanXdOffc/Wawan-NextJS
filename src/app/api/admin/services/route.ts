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
      data: {
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
    console.error("Get service settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to get settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    let settings = await ServiceSettings.findOne();
    if (!settings) {
      settings = await ServiceSettings.create({});
    }
    
    if (body.musicPlayer !== undefined) settings.musicPlayer = body.musicPlayer;
    if (body.library !== undefined) settings.library = body.library;
    if (body.aiImage !== undefined) settings.aiImage = body.aiImage;
    if (body.tempMail !== undefined) settings.tempMail = body.tempMail;
    if (body.uploader !== undefined) settings.uploader = body.uploader;
    if (body.wanyzxAi !== undefined) settings.wanyzxAi = body.wanyzxAi;
    if (body.webParser !== undefined) settings.webParser = body.webParser;
    
    await settings.save();
    
    return NextResponse.json({
      success: true,
      data: {
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
    console.error("Update service settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
