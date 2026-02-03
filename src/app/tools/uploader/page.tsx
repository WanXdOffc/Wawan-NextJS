"use client";

import { useServiceStatus } from "@/hooks/useServiceStatus";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Copy,
  Check,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
  Code,
  Clock,
  Download,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UploadResult {
  shortId: string;
  filename: string;
  mimeType: string;
  size: number;
  previewUrl: string;
  rawUrl: string;
  directUrl: string;
  downloadUrl: string;
  htmlEmbed: string;
  expiresAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith("image/")) return FileImage;
  if (mimeType?.startsWith("video/")) return FileVideo;
  if (mimeType?.startsWith("audio/")) return FileAudio;
  return File;
}

export default function UploaderPage() {
  const { services, loading: serviceLoading } = useServiceStatus();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    setResult(null);
    setPreviewSrc(null);

    if (file.type.startsWith("image/") || file.type.startsWith("video/") || file.type.startsWith("audio/")) {
      setPreviewSrc(URL.createObjectURL(file));
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

        if (!data.success) {
          toast.error(data.error || "Upload failed");
          return;
        }

        setResult(data.result);
        toast.success("File berhasil diunggah!");
      } catch (error: any) {
        toast.error("Gagal mengunggah file");
      } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const openInNewTab = (url: string) => {
    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
  };

  const reset = () => {
    setResult(null);
    setError("");
    setPreviewSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const FileIcon = result ? getFileIcon(result.mimeType) : File;

  if (serviceLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--theme-primary))]" />
      </div>
    );
  }

  if (services && !services.uploader) {
    return <ServiceDisabled serviceName="File Uploader" />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] text-sm font-medium mb-4">
            <Upload className="w-4 h-4" />
            File Uploader
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">
            Up<span className="gradient-text">loader</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload file apapun dan dapatkan link yang bisa dibagikan. File akan dihapus otomatis setelah 30 hari.
          </p>
          <p className="text-muted-foreground/70 text-sm mt-2">
            Max 100MB • All file types supported
          </p>
        </motion.div>

        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer p-12 rounded-2xl border-2 border-dashed transition-all ${
                dragOver
                  ? "border-[hsl(var(--theme-primary))] bg-[hsl(var(--theme-primary)/0.1)]"
                  : "border-border hover:border-[hsl(var(--theme-primary)/0.5)] bg-card"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="text-center">
                {uploading ? (
                  <>
                    {previewSrc && (
                      <div className="mb-4">
                        <img
                          src={previewSrc}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded-lg opacity-50"
                        />
                      </div>
                    )}
                    <Loader2 className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--theme-primary))] animate-spin" />
                    <p className="text-foreground font-medium">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center">
                      <Upload className="w-10 h-10 text-[hsl(var(--theme-primary))]" />
                    </div>
                    <p className="text-foreground font-medium mb-2">
                      Drop file disini atau klik untuk upload
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Gambar, Video, Audio, Dokumen, dan lainnya
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center">
                    <FileIcon className="w-7 h-7 text-[hsl(var(--theme-primary))]" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium truncate max-w-[250px]">
                      {result.filename}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatBytes(result.size)} • {result.mimeType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  <span>30 hari</span>
                </div>
              </div>
            </div>

            {result.mimeType?.startsWith("image/") && (
              <div className="p-4 border-b border-border bg-muted/30">
                <img
                  src={result.directUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-xl"
                />
              </div>
            )}

            {result.mimeType?.startsWith("video/") && (
              <div className="p-4 border-b border-border bg-muted/30">
                <video
                  src={result.directUrl}
                  controls
                  className="w-full max-h-64 rounded-xl"
                />
              </div>
            )}

            {result.mimeType?.startsWith("audio/") && (
              <div className="p-4 border-b border-border bg-muted/30">
                <audio src={result.directUrl} controls className="w-full" />
              </div>
            )}

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
                    value={result.previewUrl}
                    className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm font-mono"
                  />
                  <button
                    onClick={() => openInNewTab(result.previewUrl)}
                    className="px-4 py-3 rounded-xl bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors"
                    title="Buka di tab baru"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.previewUrl, "preview")}
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
                    value={result.rawUrl}
                    className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm font-mono"
                  />
                  <button
                    onClick={() => openInNewTab(result.rawUrl)}
                    className="px-4 py-3 rounded-xl bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors"
                    title="Buka di tab baru"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.rawUrl, "raw")}
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
                      value={result.htmlEmbed}
                      rows={2}
                      className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm font-mono resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(result.htmlEmbed, "html")}
                      className="px-4 py-3 rounded-xl bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors self-start"
                    >
                      {copied === "html" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Kode HTML untuk embed di website
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Download className="w-4 h-4" />
                    Download Page Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={result.downloadUrl}
                      className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm font-mono"
                    />
                    <button
                      onClick={() => openInNewTab(result.downloadUrl)}
                      className="px-4 py-3 rounded-xl bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors"
                      title="Buka di tab baru"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(result.downloadUrl, "download")}
                      className="px-4 py-3 rounded-xl bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors"
                    >
                      {copied === "download" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Link ke halaman download dengan style terminal (kayak MediaFire)
                  </p>
                </div>
              </div>

            <div className="p-6 bg-muted/30 border-t border-border flex gap-3">
              <Link
                href={`/f/${result.shortId}`}
                className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white hover:opacity-90 transition-opacity text-center"
              >
                Lihat Halaman Preview
              </Link>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-xl font-medium border border-border hover:bg-accent transition-colors text-foreground"
              >
                Upload Lagi
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
