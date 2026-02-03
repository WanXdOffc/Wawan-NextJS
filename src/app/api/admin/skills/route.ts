import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Skill from "@/lib/models/Skill";
import { logActivity } from "@/lib/logActivity";

export async function GET() {
  try {
    await connectDB();
    const skills = await Skill.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json({ skills: [] });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const count = await Skill.countDocuments();
    body.order = count;

    const skill = await Skill.create(body);
    
    await logActivity({
      action: 'create',
      entityType: 'skill',
      entityId: skill._id.toString(),
      entityName: skill.name,
    });
    
    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
