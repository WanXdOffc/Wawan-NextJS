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
  Code2,
  Lock,
  Unlock,
  Eye,
  Hash,
  FileCode,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface LibraryCode {
  _id: string;
  title: string;
  description: string;
  progLanguage: string;
  hashtags: string[];
  code: string;
  exampleUsage?: string;
  output?: string;
  accessType: "free" | "password";
  password?: string;
  downloadUrl?: string;
  downloadType?: "code" | "zip";
  views: number;
  createdAt: string;
}

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "PHP", "Java", "C++", "C#", "Go", "Rust", "Ruby",
  "Swift", "Kotlin", "Dart", "HTML", "CSS", "SCSS", "SQL", "Shell", "Bash", "PowerShell",
  "JSON", "YAML", "Markdown", "Other"
];

export default function AdminLibrary() {
  const [codes, setCodes] = useState<LibraryCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<LibraryCode | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "JavaScript",
    hashtags: "",
    code: "",
    exampleUsage: "",
    output: "",
    accessType: "free" as "free" | "password",
    password: "",
    downloadUrl: "",
    downloadType: "code" as "code" | "zip",
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/admin/library");
      const data = await res.json();
      setCodes(data.data || []);
    } catch (error) {
      console.error("Failed to fetch library:", error);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingCode(null);
    setFormData({
      title: "",
      description: "",
      language: "JavaScript",
      hashtags: "",
      code: "",
      exampleUsage: "",
      output: "",
      accessType: "free",
      password: "",
      downloadUrl: "",
      downloadType: "code",
    });
    setModalOpen(true);
  };

  const openEditModal = (code: LibraryCode) => {
    setEditingCode(code);
    setFormData({
      title: code.title,
      description: code.description,
      language: code.progLanguage,
      hashtags: code.hashtags?.join(", ") || "",
      code: code.code,
      exampleUsage: code.exampleUsage || "",
      output: code.output || "",
      accessType: code.accessType,
      password: code.password || "",
      downloadUrl: code.downloadUrl || "",
      downloadType: code.downloadType || "code",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        hashtags: formData.hashtags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const url = editingCode
        ? `/api/admin/library/${editingCode._id}`
        : "/api/admin/library";
      const method = editingCode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchCodes();
      }
    } catch (error) {
      console.error("Failed to save code:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!codeToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/library/${codeToDelete}`, { method: "DELETE" });
      fetchCodes();
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    } catch (error) {
      console.error("Failed to delete code:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCodeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const filteredCodes = codes.filter(
    (code) =>
      code.title.toLowerCase().includes(search.toLowerCase()) ||
      code.description.toLowerCase().includes(search.toLowerCase()) ||
      code.progLanguage.toLowerCase().includes(search.toLowerCase()) ||
      code.hashtags?.some((h) => h.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Library</h1>
          <p className="text-gray-400">Manage your code snippets & resources</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          New Code
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#12121a] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      <div className="bg-[#12121a] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredCodes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No codes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Language</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 hidden lg:table-cell">Hashtags</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Access</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 hidden sm:table-cell">Views</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCodes.map((code) => (
                  <tr key={code._id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                          <FileCode className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium truncate max-w-[200px]">{code.title}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[200px]">{code.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">{code.progLanguage}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {code.hashtags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-400">
                            #{tag}
                          </span>
                        ))}
                        {code.hashtags?.length > 3 && (
                          <span className="text-gray-500 text-xs">+{code.hashtags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        code.accessType === "free"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {code.accessType === "free" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {code.accessType === "free" ? "Free" : "Password"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="flex items-center gap-1 text-gray-400 text-sm">
                        <Eye className="w-4 h-4" />
                        {code.views}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(code)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(code._id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Code snippet"
          description="Are you sure you want to delete this code snippet? This action cannot be undone."
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
              className="fixed inset-4 z-50 m-auto max-w-3xl max-h-[90vh] overflow-y-auto bg-[#12121a] rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingCode ? "Edit Code" : "New Code"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                      placeholder="Code title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Language *</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-[#12121a]">{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 resize-none"
                    placeholder="Brief description of the code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                    placeholder="api, utility, helper, authentication"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Code *</label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 font-mono text-sm resize-none"
                    placeholder="Paste your code here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Example Usage (optional)</label>
                    <textarea
                      value={formData.exampleUsage}
                      onChange={(e) => setFormData({ ...formData, exampleUsage: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 font-mono text-sm resize-none"
                      placeholder="// Example usage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Output (optional)</label>
                    <textarea
                      value={formData.output}
                      onChange={(e) => setFormData({ ...formData, output: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 font-mono text-sm resize-none"
                      placeholder="Expected output"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Access Type</label>
                    <select
                      value={formData.accessType}
                      onChange={(e) => setFormData({ ...formData, accessType: e.target.value as "free" | "password" })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                    >
                      <option value="free" className="bg-[#12121a]">Free Access</option>
                      <option value="password" className="bg-[#12121a]">Password Protected</option>
                    </select>
                  </div>
                  {formData.accessType === "password" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                        placeholder="Access password"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Download URL (optional)</label>
                    <input
                      type="text"
                      value={formData.downloadUrl}
                      onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                      placeholder="https://example.com/file.zip"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Download Type</label>
                    <select
                      value={formData.downloadType}
                      onChange={(e) => setFormData({ ...formData, downloadType: e.target.value as "code" | "zip" })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                    >
                      <option value="code" className="bg-[#12121a]">Code Snippet</option>
                      <option value="zip" className="bg-[#12121a]">ZIP/Archive</option>
                    </select>
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
                  disabled={saving || !formData.title || !formData.description || !formData.code}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
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
