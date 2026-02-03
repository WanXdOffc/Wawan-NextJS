import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";
import Product from "@/lib/models/Product";
import Skill from "@/lib/models/Skill";
import Project from "@/lib/models/Project";
import { Upload } from "@/lib/models/Upload";
import Music from "@/lib/models/Music";
import LibraryCode from "@/lib/models/LibraryCode";
import Notification from "@/lib/models/Notification";
import { ActivityLog } from "@/lib/models/ActivityLog";

export async function GET() {
  try {
    await connectDB();

    const [
      blogsTotal,
      blogsPublished,
      productsTotal,
      productsFeatured,
      skillsTotal,
      projectsTotal,
      filesTotal,
      musicTotal,
      libraryTotal,
      notificationsTotal,
      notificationsActive,
      recentActivities,
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ published: true }),
      Product.countDocuments(),
      Product.countDocuments({ featured: true }),
      Skill.countDocuments(),
      Project.countDocuments(),
      Upload.countDocuments(),
      Music.countDocuments(),
      LibraryCode.countDocuments(),
      Notification.countDocuments(),
      Notification.countDocuments({ isActive: true }),
      ActivityLog.find().sort({ timestamp: -1 }).limit(10).lean(),
    ]);

    const recent = recentActivities.map((a: any) => ({
      _id: a._id.toString(),
      type: a.entityType,
      action: a.action,
      title: a.entityName || a.description,
      name: a.entityName,
      description: a.description,
      createdAt: a.timestamp,
    }));

    return NextResponse.json({
      stats: {
        blogs: { total: blogsTotal, published: blogsPublished },
        products: { total: productsTotal, featured: productsFeatured },
        skills: { total: skillsTotal },
        projects: { total: projectsTotal },
        files: { total: filesTotal },
        music: { total: musicTotal },
        library: { total: libraryTotal },
        notifications: { total: notificationsTotal, active: notificationsActive },
      },
      recent,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
