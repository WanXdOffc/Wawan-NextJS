import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Analytics } from "@/lib/models/Analytics";
import Blog from "@/lib/models/Blog";
import Project from "@/lib/models/Project";
import { Upload } from "@/lib/models/Upload";
import Product from "@/lib/models/Product";
import Music from "@/lib/models/Music";
import LibraryCode from "../../../../lib/models/LibraryCode";
import Skill from "@/lib/models/Skill";
import Notification from "@/lib/models/Notification";
import Request from "@/lib/models/Request";
import Donation from "@/lib/models/Donation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "blog";
    const period = parseInt(searchParams.get("period") || "7");

    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Filter paths based on type
    let pathPrefix = "/blog/";
    if (type === "file") pathPrefix = "/f/";
    if (type === "project") pathPrefix = "/projects/";
    if (type === "tool") pathPrefix = "/tools/";
    if (type === "product") pathPrefix = "/shop/";
    if (type === "music") pathPrefix = "/music/";
    if (type === "library") pathPrefix = "/library/";
    if (type === "skill") pathPrefix = "/skills";
    if (type === "notification") pathPrefix = "/notifications";
    if (type === "request") pathPrefix = "/request";
    if (type === "donation") pathPrefix = "/donate";

    const stats = await Analytics.aggregate([
      {
        $match: {
          type: "page_view",
          path: { 
            $regex: `^${pathPrefix}`, 
            $options: "i",
            $not: /\/admin/i // Exclude admin paths
          },
          timestamp: { $gte: startDate },
        },
      },
      {
        $project: {
          // Normalize path by removing query params and trailing slash
          normalizedPath: {
            $let: {
              vars: {
                pathWithoutQuery: { $arrayElemAt: [{ $split: ["$path", "?"] }, 0] }
              },
              in: {
                $cond: {
                  if: { 
                    $and: [
                      { $gt: [{ $strLenCP: "$$pathWithoutQuery" }, 1] },
                      { $eq: [{ $substrCP: ["$$pathWithoutQuery", { $subtract: [{ $strLenCP: "$$pathWithoutQuery" }, 1] }, 1] }, "/"] }
                    ]
                  },
                  then: { $substrCP: ["$$pathWithoutQuery", 0, { $subtract: [{ $strLenCP: "$$pathWithoutQuery" }, 1] }] },
                  else: "$$pathWithoutQuery"
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$normalizedPath",
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    // Populate data based on type
    const leaderboard = await Promise.all(
      stats.map(async (stat) => {
        let title = stat._id;
        let image = "";

        try {
          if (type === "blog") {
            const slug = stat._id.split("/").pop();
            if (slug) {
              const blog = await Blog.findOne({ slug }).select("title coverImage").lean();
              if (blog) {
                title = blog.title;
                image = blog.coverImage;
              }
            }
          } else if (type === "file") {
            const shortId = stat._id.split("/").pop();
            if (shortId) {
              const file = await Upload.findOne({ shortId }).select("originalName").lean();
              if (file) {
                title = file.originalName;
              }
            }
          } else if (type === "project") {
            const name = stat._id.split("/").pop();
            if (name) {
              const project = await Project.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }).select("name image").lean();
              if (project) {
                title = project.name;
                image = project.image;
              }
            }
          } else if (type === "product") {
            const slug = stat._id.split("/").pop();
            if (slug) {
              const product = await Product.findOne({ slug }).select("name image").lean();
              if (product) {
                title = product.name;
                image = product.image;
              }
            }
          } else if (type === "music") {
            const slug = stat._id.split("/").pop();
            if (slug) {
              const music = await Music.findOne({ slug }).select("title coverImage").lean();
              if (music) {
                title = music.title;
                image = music.coverImage;
              }
            }
          } else if (type === "library") {
            const id = stat._id.split("/").pop();
            if (id && mongoose.Types.ObjectId.isValid(id)) {
              const library = await LibraryCode.findById(id).select("title").lean();
              if (library) {
                title = (library as any).title;
              }
            }
          } else if (type === "tool") {
            const toolName = stat._id.split("/").pop();
            title = toolName.charAt(0).toUpperCase() + toolName.slice(1) + " Tool";
          } else if (type === "skill") {
            title = "Skills Page";
          } else if (type === "notification") {
            title = "Notifications Page";
          } else if (type === "request") {
            title = "Requests Page";
          } else if (type === "donation") {
            title = "Donation Page";
          }
        } catch (err) {
          console.error(`Error populating ${type} leaderboard item:`, err);
        }

        return {
          path: stat._id,
          title: title || stat._id,
          image,
          views: stat.views,
        };
      })
    );

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
