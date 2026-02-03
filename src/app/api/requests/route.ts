import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Request from "@/lib/models/Request";

const RATE_LIMIT_HOURS = 24;
const MAX_REQUESTS_PER_DAY = 2;

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const request = formData.get("request") as string;
    const screenshot = formData.get("screenshot") as File | null;

    if (!name || !email || !request) {
      return NextResponse.json(
        { error: "Nama, email, dan request wajib diisi" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Nama maksimal 100 karakter" },
        { status: 400 }
      );
    }

    if (request.length > 2000) {
      return NextResponse.json(
        { error: "Request maksimal 2000 karakter" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                      req.headers.get("x-real-ip") || 
                      "unknown";

    const rateLimitDate = new Date();
    rateLimitDate.setHours(rateLimitDate.getHours() - RATE_LIMIT_HOURS);

    const recentRequestsByEmail = await Request.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gte: rateLimitDate },
    });

    if (recentRequestsByEmail >= MAX_REQUESTS_PER_DAY) {
      return NextResponse.json(
        { error: `Kamu sudah mengirim ${MAX_REQUESTS_PER_DAY} request dalam 24 jam terakhir. Coba lagi nanti.` },
        { status: 429 }
      );
    }

    const recentRequestsByIP = await Request.countDocuments({
      ipAddress,
      createdAt: { $gte: rateLimitDate },
    });

    if (recentRequestsByIP >= MAX_REQUESTS_PER_DAY * 2) {
      return NextResponse.json(
        { error: "Terlalu banyak request dari IP ini. Coba lagi nanti." },
        { status: 429 }
      );
    }

    let screenshotUrl = null;
    if (screenshot && screenshot.size > 0) {
      if (screenshot.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Screenshot maksimal 5MB" },
          { status: 400 }
        );
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(screenshot.type)) {
        return NextResponse.json(
          { error: "Format screenshot harus JPEG, PNG, GIF, atau WebP" },
          { status: 400 }
        );
      }

      const bytes = await screenshot.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      screenshotUrl = `data:${screenshot.type};base64,${base64}`;
    }

    const newRequest = await Request.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      request: request.trim(),
      screenshot: screenshotUrl,
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Request berhasil dikirim! Terima kasih atas masukanmu.",
      id: newRequest._id,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Gagal mengirim request" },
      { status: 500 }
    );
  }
}
