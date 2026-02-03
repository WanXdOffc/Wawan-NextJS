import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LibraryCode from "@/lib/models/LibraryCode";

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const language = searchParams.get("language") || "";
    const hashtag = searchParams.get("hashtag") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { hashtags: { $regex: search, $options: "i" } },
      ];
    }

    if (language) {
      query.progLanguage = language;
    }

    if (hashtag) {
      query.hashtags = hashtag;
    }

    const total = await LibraryCode.countDocuments(query);
    const codes = await LibraryCode.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const languages = await LibraryCode.distinct("progLanguage");
    const hashtags = await LibraryCode.distinct("hashtags");

    return NextResponse.json({
      success: true,
      data: codes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        languages,
        hashtags,
      },
    });
  } catch (error) {
    console.error("Library fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch library" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { password: inputPassword, id } = body;

    if (id) {
      const code = await LibraryCode.findById(id);
      if (!code) {
        return NextResponse.json(
          { success: false, error: "Code not found" },
          { status: 404 }
        );
      }

      if (code.accessType === "password") {
        if (!inputPassword || inputPassword !== code.password) {
          return NextResponse.json(
            { success: false, error: "Invalid password" },
            { status: 401 }
          );
        }
      }

      await LibraryCode.findByIdAndUpdate(id, { $inc: { views: 1 } });

      return NextResponse.json({
        success: true,
        data: {
          _id: code._id,
          title: code.title,
          description: code.description,
          language: code.progLanguage,
          hashtags: code.hashtags,
          code: code.code,
          exampleUsage: code.exampleUsage,
          output: code.output,
          accessType: code.accessType,
          downloadUrl: code.downloadUrl,
          downloadType: code.downloadType,
          views: code.views,
          createdAt: code.createdAt,
          updatedAt: code.updatedAt,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "ID is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Library access error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to access code" },
      { status: 500 }
    );
  }
}
