"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag, Share2, FileText, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { toast } from "sonner";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  views: number;
  createdAt: string;
}

interface BlogContentProps {
  slug: string;
  initialBlog: Blog | null;
}

export function BlogContent({ slug, initialBlog }: BlogContentProps) {
  const [blog, setBlog] = useState<Blog | null>(initialBlog);
  const [loading, setLoading] = useState(!initialBlog);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialBlog) return;

    fetch(`/api/blogs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.blog) {
          setBlog(data.blog);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug, initialBlog]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[hsl(var(--theme-primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>
        <p className="text-muted-foreground mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/blog">
          <Button>Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <article className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {blog.coverImage ? (
            <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-8">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
          ) : (
            <div className="h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center">
              <FileText className="w-24 h-24 text-muted-foreground" />
            </div>
          )}

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-[hsl(var(--theme-primary)/0.1)] text-[hsl(var(--theme-primary))]"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
            {blog.title}
          </h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(blog.createdAt)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {calculateReadTime(blog.content)} min read
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {blog.views || 0} views
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 ml-auto px-4 py-2 rounded-full bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.5)] transition-all"
              >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          <MarkdownRenderer content={blog.content} />
        </motion.div>
      </article>
    </div>
  );
}
