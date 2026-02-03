import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Skill from "@/lib/models/Skill";
import { logActivity } from "@/lib/logActivity";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const skill = await Skill.findById(id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Error fetching skill:", error);
    return NextResponse.json({ error: "Failed to fetch skill" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const skill = await Skill.findByIdAndUpdate(id, body, { new: true });
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    
    await logActivity({
      action: 'update',
      entityType: 'skill',
      entityId: id,
      entityName: skill.name,
    });
    
    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    
    await logActivity({
      action: 'delete',
      entityType: 'skill',
      entityId: id,
      entityName: skill.name,
    });
    
    return NextResponse.json({ message: "Skill deleted" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
