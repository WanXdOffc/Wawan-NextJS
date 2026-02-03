import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Request from "@/lib/models/Request";

async function getAdminPassword() {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) return envPassword;
  
  try {
    await connectDB();
    const Settings = (await import("@/lib/models/Settings")).default;
    const settings = await Settings.findOne({});
    return settings?.adminPassword || "wanyzx123";
  } catch {
    return "wanyzx123";
  }
}

export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get("x-admin-password");
    const adminPassword = await getAdminPassword();

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      Request.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Request.countDocuments(query),
    ]);

    return NextResponse.json({
      requests: JSON.parse(JSON.stringify(requests)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data requests" },
      { status: 500 }
    );
  }
}
