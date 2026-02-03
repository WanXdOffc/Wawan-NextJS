import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";
import { BlogContent } from "./BlogContent";

interface BlogData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  createdAt: string;
}

async function getBlog(slug: string, increment: boolean = false): Promise<BlogData | null> {
  try {
    await connectDB();
    let blog;
    if (increment) {
      blog = await Blog.findOneAndUpdate(
        { slug, published: true },
        { $inc: { views: 1 } },
        { new: true }
      ).lean();
    } else {
      blog = await Blog.findOne({ slug, published: true }).lean();
    }
    
    if (!blog) return null;
    return JSON.parse(JSON.stringify(blog));
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug, false);

  if (!blog) {
    return {
      title: "Blog Not Found",
      description: "The blog post you're looking for doesn't exist.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wanyzx.com";

  return {
    title: `${blog.title} | Wanyzx Blog`,
    description: blog.excerpt || blog.content.slice(0, 160),
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.content.slice(0, 160),
      type: "article",
      url: `${siteUrl}/blog/${blog.slug}`,
      images: blog.coverImage
        ? [
            {
              url: blog.coverImage,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ]
        : [],
      publishedTime: blog.createdAt,
      tags: blog.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt || blog.content.slice(0, 160),
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug, true);

  return <BlogContent slug={slug} initialBlog={blog} />;
}
