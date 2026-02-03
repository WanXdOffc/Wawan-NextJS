"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Calendar,
  HardDrive,
  Users,
  Clock,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface FileData {
  shortId: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  downloads: number;
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

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith("image/")) return FileImage;
  if (mimeType?.startsWith("video/")) return FileVideo;
  if (mimeType?.startsWith("audio/")) return FileAudio;
  return File;
}

function getFileColor(mimeType: string) {
  if (mimeType?.startsWith("image/")) return "text-pink-400";
  if (mimeType?.startsWith("video/")) return "text-blue-400";
  if (mimeType?.startsWith("audio/")) return "text-emerald-400";
  return "text-amber-400";
}

export default function DownloadPageClient({ file }: { file: FileData }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadCount, setDownloadCount] = useState(file.downloads || 0);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const fullText = `> Initializing download server...\n> File located: ${file.originalName}\n> Size: ${formatBytes(file.size)}\n> Status: Ready for download\n> Click the button below to start download`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [fullText]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await fetch(`/api/files/${file.shortId}/download`, { method: "POST" });
      setDownloadCount((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      const link = document.createElement("a");
      link.href = file.path;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1500);
  };

  const FileIcon = getFileIcon(file.mimeType);
  const fileColor = getFileColor(file.mimeType);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,80,255,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(80,200,120,0.05),transparent_50%)]" />
      
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl relative"
      >
        <div className="rounded-2xl overflow-hidden bg-[#121212] border border-white/5 shadow-2xl shadow-violet-500/5">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition cursor-pointer" />
            </div>
            <div className="flex-1 flex justify-center">
              <span className="text-xs text-gray-500 font-mono px-3 py-1 rounded-md bg-white/5">
                wanyzx://download/{file.shortId}
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-violet-400/50" />
          </div>

          <div className="p-6 font-mono text-sm">
            <div className="mb-6 text-gray-400 whitespace-pre-wrap leading-relaxed">
              {typedText.split('\n').map((line, i) => (
                <div key={i} className={line.startsWith('>') ? 'text-emerald-400/80' : ''}>
                  {line}
                </div>
              ))}
              <span className={`inline-block w-2 h-4 bg-emerald-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center ${fileColor}`}>
                  <FileIcon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-base">{file.originalName}</p>
                  <p className="text-gray-500 text-xs mt-1">{file.mimeType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <HardDrive className="w-4 h-4 text-violet-400" />
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="text-white font-medium">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-500">Downloads</p>
                    <p className="text-white font-medium">{downloadCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500">Uploaded</p>
                    <p className="text-white font-medium">{new Date(file.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs text-gray-500">Expires</p>
                    <p className="text-white font-medium">{new Date(file.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleDownload}
              disabled={downloading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.2),transparent_70%)]" />
              <div className="relative flex items-center justify-center gap-3 py-4 px-6 font-semibold text-white">
                <AnimatePresence mode="wait">
                  {downloading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-3"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-mono">Preparing download...</span>
                    </motion.div>
                  ) : downloaded ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-mono">Download started!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="download"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-3"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-mono">./download.sh</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Secure download • No waiting time</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600 font-mono">
            Powered by <span className="text-violet-400">wanyzx.com</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
