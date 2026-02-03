"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Download,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Clock,
  Link as LinkIcon,
  Code,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface FileData {
  shortId: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
  expiresAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  return File;
}

function daysUntilExpiry(expiresAt: string): number {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function FilePreviewClient({ file }: { file: FileData }) {
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const previewUrl = `${baseUrl}/f/${file.shortId}`;
  const rawUrl = `${baseUrl}/raw/${file.shortId}/${encodeURIComponent(file.originalName)}`;
  
  const htmlEmbed = file.mimeType.startsWith("image/")
    ? `<img src="${rawUrl}" alt="${file.originalName}" />`
    : file.mimeType.startsWith("video/")
      ? `<video src="${rawUrl}" controls></video>`
      : file.mimeType.startsWith("audio/")
        ? `<audio src="${rawUrl}" controls></audio>`
        : `<a href="${rawUrl}" download>${file.originalName}</a>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const FileIcon = getFileIcon(file.mimeType);
  const daysLeft = daysUntilExpiry(file.expiresAt);

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/tools/uploader"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            ← Back to Uploader
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {file.mimeType.startsWith("image/") && (
            <div className="bg-muted/30 p-8 flex items-center justify-center border-b border-border">
              <img
                src={file.path}
                alt={file.originalName}
                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-xl"
              />
            </div>
          )}

          {file.mimeType.startsWith("video/") && (
            <div className="bg-muted/30 p-8 flex items-center justify-center border-b border-border">
              <video
                src={file.path}
                controls
                className="max-w-full max-h-[500px] rounded-lg shadow-xl"
              />
            </div>
          )}

          {file.mimeType.startsWith("audio/") && (
            <div className="bg-muted/30 p-8 border-b border-border">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center">
                  <FileAudio className="w-12 h-12 text-[hsl(var(--theme-primary))]" />
                </div>
                <audio src={file.path} controls className="w-full" />
              </div>
            </div>
          )}

          {!file.mimeType.startsWith("image/") &&
            !file.mimeType.startsWith("video/") &&
            !file.mimeType.startsWith("audio/") && (
              <div className="bg-muted/30 p-12 flex flex-col items-center justify-center border-b border-border">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center mb-4">
                  <FileIcon className="w-12 h-12 text-[hsl(var(--theme-primary))]" />
                </div>
                <p className="text-muted-foreground">Preview not available</p>
              </div>
            )}

          <div className="p-6 border-b border-border">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center flex-shrink-0">
                <FileIcon className="w-7 h-7 text-[hsl(var(--theme-primary))]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground truncate mb-1">
                  {file.originalName}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>{file.mimeType}</span>
                </div>
              </div>
              <a
                href={file.path}
                download={file.originalName}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Uploaded: {formatDate(file.createdAt)}
              </span>
              <span className={`flex items-center gap-1 ${daysLeft <= 7 ? "text-amber-400" : ""}`}>
                <Clock className="w-4 h-4" />
                Expires in {daysLeft} days
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <LinkIcon className="w-4 h-4" />
                Preview Link (Short)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={previewUrl}
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(previewUrl, "preview")}
                  className="px-4 py-3 rounded-xl bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors"
                >
                  {copied === "preview" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Link ke halaman preview dengan info file
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <ExternalLink className="w-4 h-4" />
                Direct Link (Full dengan nama file)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={rawUrl}
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(rawUrl, "raw")}
                  className="px-4 py-3 rounded-xl bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors"
                >
                  {copied === "raw" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Link langsung ke file untuk ditampilkan di browser
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Code className="w-4 h-4" />
                HTML Embed Code
              </label>
              <div className="flex gap-2">
                <textarea
                  readOnly
                  value={htmlEmbed}
                  rows={2}
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm font-mono resize-none"
                />
                <button
                  onClick={() => copyToClipboard(htmlEmbed, "html")}
                  className="px-4 py-3 rounded-xl bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors self-start"
                >
                  {copied === "html" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Kode HTML untuk embed di website
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
