import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const query = search
      ? { originalName: { $regex: search, $options: "i" } }
      : {};

    const [files, total] = await Promise.all([
      Upload.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Upload.countDocuments(query),
    ]);

    const totalSize = await Upload.aggregate([
      { $group: { _id: null, total: { $sum: "$size" } } },
    ]);

    return NextResponse.json({
      success: true,
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalFiles: total,
        totalSize: totalSize[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get files" },
      { status: 500 }
    );
  }
}
