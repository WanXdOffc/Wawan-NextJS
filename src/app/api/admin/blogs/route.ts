import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";
import { logActivity } from "@/lib/logActivity";

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ blogs: [] });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const blog = await Blog.create(body);
    
    await logActivity({
      action: 'create',
      entityType: 'blog',
      entityId: blog._id.toString(),
      entityName: blog.title,
    });
    
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
