import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import LibraryCode from "@/lib/models/LibraryCode";
import { LibraryDetailContent } from "./LibraryDetailContent";

interface CodeMeta {
  _id: string;
  title: string;
  description: string;
  progLanguage: string;
  hashtags: string[];
  accessType: "free" | "password";
  views: number;
  createdAt: string;
}

async function getCodeMeta(id: string): Promise<CodeMeta | null> {
  try {
    await connectDB();
    const item = await LibraryCode.findById(id)
      .select("title description progLanguage hashtags accessType views createdAt")
      .lean();
    if (!item) return null;
    return JSON.parse(JSON.stringify(item));
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const code = await getCodeMeta(id);

  if (!code) {
    return {
      title: "Code Not Found | Wanyzx Library",
      description: "The code you're looking for doesn't exist.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wanyzx.com";

  return {
    title: `${code.title} | Wanyzx Library`,
    description: code.description || `Code snippet in ${code.progLanguage}`,
    openGraph: {
      title: `${code.title} | Wanyzx Library`,
      description: code.description || `Code snippet in ${code.progLanguage}`,
      type: "article",
      url: `${siteUrl}/library/${id}`,
    },
    twitter: {
      card: "summary",
      title: `${code.title} | Wanyzx Library`,
      description: code.description || `Code snippet in ${code.progLanguage}`,
    },
  };
}

export default async function LibraryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LibraryDetailContent id={id} />;
}
