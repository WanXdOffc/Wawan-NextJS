"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Megaphone,
  Image,
  Music,
  Eye,
  EyeOff,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Notification {
  _id: string;
  title: string;
  content: string;
  category: "info" | "warning" | "error" | "success" | "announcement";
  mediaType: "none" | "image" | "gif" | "audio";
  mediaUrl: string;
  active: boolean;
  showOnce: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const categoryConfig = {
  info: { icon: Info, color: "blue", label: "Info" },
  warning: { icon: AlertTriangle, color: "yellow", label: "Warning" },
  error: { icon: AlertCircle, color: "red", label: "Error" },
  success: { icon: CheckCircle, color: "emerald", label: "Success" },
  announcement: { icon: Megaphone, color: "purple", label: "Announcement" },
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "info" as Notification["category"],
    mediaType: "none" as Notification["mediaType"],
    mediaUrl: "",
    active: true,
    showOnce: false,
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingNotification(null);
    setFormData({
      title: "",
      content: "",
      category: "info",
      mediaType: "none",
      mediaUrl: "",
      active: true,
      showOnce: false,
      expiresAt: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      category: notification.category,
      mediaType: notification.mediaType,
      mediaUrl: notification.mediaUrl || "",
      active: notification.active,
      showOnce: notification.showOnce,
      expiresAt: notification.expiresAt ? notification.expiresAt.slice(0, 16) : "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      const url = editingNotification
        ? `/api/admin/notifications/${editingNotification._id}`
        : "/api/admin/notifications";
      const method = editingNotification ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to save notification:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/notifications/${notificationToDelete}`, { method: "DELETE" });
      fetchNotifications();
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const toggleActive = async (notification: Notification) => {
    try {
      await fetch(`/api/admin/notifications/${notification._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !notification.active }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to toggle active:", error);
    }
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400">Manage popup notifications for visitors</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          New Notification
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#12121a] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      <div className="bg-[#12121a] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 hidden lg:table-cell">Media</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredNotifications.map((notification) => {
                  const config = categoryConfig[notification.category];
                  const Icon = config.icon;
                  return (
                    <tr key={notification._id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium truncate max-w-[200px]">{notification.title}</p>
                        <p className="text-gray-500 text-sm truncate max-w-[200px]">{notification.content.slice(0, 50)}...</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-500/10 text-${config.color}-400`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-gray-400 text-sm capitalize">
                          {notification.mediaType === "none" ? "-" : notification.mediaType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(notification)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            notification.active
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {notification.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {notification.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(notification)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(notification._id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 z-50 m-auto max-w-2xl max-h-[90vh] overflow-y-auto bg-[#12121a] rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingNotification ? "Edit Notification" : "New Notification"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Content (Markdown supported)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 resize-none"
                    placeholder="**Bold**, *italic*, [link](url), etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Notification["category"] })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="success">Success</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Media Type</label>
                    <select
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as Notification["mediaType"] })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="none">None</option>
                      <option value="image">Image</option>
                      <option value="gif">GIF</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                </div>

                {formData.mediaType !== "none" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Media URL
                      {formData.mediaType === "image" && <Image className="w-4 h-4 inline ml-2" />}
                      {formData.mediaType === "audio" && <Music className="w-4 h-4 inline ml-2" />}
                    </label>
                    <input
                      type="text"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                      placeholder={formData.mediaType === "audio" ? "https://example.com/audio.mp3" : "https://example.com/image.jpg"}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Expires At (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.active ? "bg-emerald-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          formData.active ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                    <span className="text-gray-400">Active</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, showOnce: !formData.showOnce })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.showOnce ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          formData.showOnce ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                    <span className="text-gray-400">Show once per user</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.title || !formData.content}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
