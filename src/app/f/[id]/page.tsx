import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";
import { notFound } from "next/navigation";
import FilePreviewClient from "./FilePreviewClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  await connectDB();
  const { id } = await params;
  const upload = await Upload.findOne({ shortId: id }).lean();

  if (!upload) {
    return { title: "File Not Found" };
  }

  const file = upload as unknown as {
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
  };

  return {
    title: `${file.originalName} - File Preview`,
    description: `View and download ${file.originalName}`,
    openGraph: {
      title: file.originalName,
      description: `File: ${file.originalName} (${formatBytes(file.size)})`,
      images: file.mimeType.startsWith("image/") ? [file.path] : undefined,
    },
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default async function FilePreviewPage({ params }: Props) {
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
    createdAt: Date;
    expiresAt: Date;
  };

  return <FilePreviewClient file={JSON.parse(JSON.stringify(file))} />;
}
