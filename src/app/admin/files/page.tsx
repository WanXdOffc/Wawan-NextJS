"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Trash2,
  Search,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  ChevronLeft,
  ChevronRight,
  Loader2,
  HardDrive,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";

interface FileItem {
  _id: string;
  shortId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
  expiresAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Stats {
  totalFiles: number;
  totalSize: number;
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
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith("image/")) return FileImage;
  if (mimeType?.startsWith("video/")) return FileVideo;
  if (mimeType?.startsWith("audio/")) return FileAudio;
  return File;
}

function daysUntilExpiry(expiresAt: string): number {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: "",
  });
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/files?${params}`);
      const data = await res.json();

      if (data.success) {
        setFiles(data.files);
        setPagination(data.pagination);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/files/${confirmDelete.id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setConfirmDelete({ isOpen: false, id: "" });
        fetchFiles();
      } else {
        alert(data.error || "Gagal menghapus file");
      }
    } catch {
      alert("Gagal menghapus file");
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFiles();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: "" })}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete File"
        description="Are you sure you want to delete this file? This will permanently remove the file from storage and it cannot be recovered."
        confirmText="Delete File"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Upload className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
              File Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola semua file yang diupload
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-accent text-foreground hover:bg-accent/80 transition-colors"
          >
            ← Kembali
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--theme-primary)/0.1)] flex items-center justify-center">
                  <File className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalFiles}</p>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--theme-primary)/0.1)] flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatBytes(stats.totalSize)}</p>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari file..."
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--theme-primary))]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[hsl(var(--theme-primary))] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Cari
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--theme-primary))]" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20">
            <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Tidak ada file</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">File</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Size</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Uploaded</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Expires</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {files.map((file, index) => {
                      const FileIcon = getFileIcon(file.mimeType);
                      const daysLeft = daysUntilExpiry(file.expiresAt);

                      return (
                        <motion.tr
                          key={file._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-accent/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--theme-primary)/0.1)] flex items-center justify-center flex-shrink-0">
                                <FileIcon className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-foreground font-medium truncate max-w-[200px]">
                                  {file.originalName}
                                </p>
                                <p className="text-muted-foreground text-xs">{file.mimeType}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">
                            {formatBytes(file.size)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-sm ${daysLeft <= 7 ? "text-amber-400" : "text-muted-foreground"}`}>
                              <Clock className="w-3 h-3" />
                              {daysLeft} hari
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/f/${file.shortId}`}
                                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                title="Preview"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => setConfirmDelete({ isOpen: true, id: file._id })}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg bg-card border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.pages}
                    className="p-2 rounded-lg bg-card border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
