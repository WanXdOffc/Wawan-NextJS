"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, 
  Trash2, 
  Loader2, 
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Image as ImageIcon,
  X,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import ConfirmDialog from "@/components/ConfirmDialog";

interface RequestItem {
  _id: string;
  name: string;
  email: string;
  request: string;
  screenshot: string | null;
  status: string;
  createdAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const password = localStorage.getItem("admin_password");
      const res = await fetch(
        `/api/admin/requests?page=${page}&limit=10&status=${statusFilter}`,
        {
          headers: {
            "x-admin-password": password || "",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    try {
      const password = localStorage.getItem("admin_password");
      const res = await fetch(`/api/admin/requests/${requestToDelete}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password || "",
        },
      });

      if (res.ok) {
        toast.success("Request berhasil dihapus");
        fetchRequests();
        setDeleteDialogOpen(false);
        setRequestToDelete(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus");
      }
    } catch {
      toast.error("Gagal menghapus request");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.request.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20">
            <Lightbulb className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Feature Requests</h1>
            <p className="text-sm text-gray-400">
              {total} total request
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau request..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20">
          <Lightbulb className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Belum ada request</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req, index) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg truncate">{req.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      req.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      req.status === "reviewed" ? "bg-blue-500/20 text-blue-400" :
                      req.status === "completed" ? "bg-green-500/20 text-green-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {req.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(req.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{req.request}</p>
                  
                  {req.screenshot && (
                    <button
                      onClick={() => setSelectedImage(req.screenshot)}
                      className="mt-3 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Lihat Screenshot
                    </button>
                  )}
                </div>
                
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(req._id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Hapus Request?"
          description="Yakin ingin menghapus request ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Hapus"
          isLoading={isDeleting}
        />

        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={selectedImage}
                  alt="Screenshot"
                  className="max-w-full max-h-[85vh] rounded-xl object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

