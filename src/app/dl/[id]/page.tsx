import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";
import { notFound } from "next/navigation";
import DownloadPageClient from "./DownloadPageClient";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const { id } = await params;
  const upload = await Upload.findOne({ shortId: id }).lean();

  if (!upload) {
    return { title: "File Not Found" };
  }

  const file = upload as unknown as {
    originalName: string;
    size: number;
  };

  return {
    title: `Download ${file.originalName} | Wanyzx`,
    description: `Download ${file.originalName} (${formatBytes(file.size)})`,
    openGraph: {
      title: `Download ${file.originalName}`,
      description: `Download ${file.originalName} (${formatBytes(file.size)})`,
    },
  };
}

export default async function DownloadPage({ params }: Props) {
  await connectDB();
  const { id } = await params;
  const upload = await Upload.findOne({ shortId: id }).lean();

  if (!upload) {
    notFound();
  }

  const file = upload as unknown as {
    shortId: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    downloads: number;
    createdAt: Date;
    expiresAt: Date;
  };

  return <DownloadPageClient file={JSON.parse(JSON.stringify(file))} />;
}
