import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Request from "@/lib/models/Request";
import { logActivity } from "@/lib/logActivity";

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const password = req.headers.get("x-admin-password");
    const adminPassword = await getAdminPassword();

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const deleted = await Request.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Request tidak ditemukan" },
        { status: 404 }
      );
    }

    await logActivity({
      action: 'delete',
      entityType: 'request',
      entityId: id,
      entityName: deleted.title || deleted.category,
    });

    return NextResponse.json({
      success: true,
      message: "Request berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Gagal menghapus request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const password = req.headers.get("x-admin-password");
    const adminPassword = await getAdminPassword();

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["pending", "reviewed", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const updated = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Request tidak ditemukan" },
        { status: 404 }
      );
    }

    await logActivity({
      action: 'update',
      entityType: 'request',
      entityId: id,
      entityName: `${updated.title || updated.category} → ${status}`,
    });

    return NextResponse.json({
      success: true,
      request: JSON.parse(JSON.stringify(updated)),
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate request" },
      { status: 500 }
    );
  }
}
