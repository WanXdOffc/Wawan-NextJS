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
  Zap,
  GripVertical,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Skill {
  _id: string;
  name: string;
  percentage: number;
  icon: string;
  category: string;
  order: number;
}

const iconOptions = [
  "react", "nextjs", "typescript", "javascript", "nodejs", "python",
  "html", "css", "tailwind", "mongodb", "postgresql", "docker",
  "git", "figma", "aws", "graphql", "redux", "vue",
];

export default function AdminSkills() {
  const searchParams = useSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    percentage: "80",
    icon: "",
    category: "general",
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openNewModal();
    }
  }, [searchParams]);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/admin/skills");
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingSkill(null);
    setFormData({
      name: "",
      percentage: "80",
      icon: "",
      category: "general",
    });
    setModalOpen(true);
  };

  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      percentage: skill.percentage.toString(),
      icon: skill.icon || "",
      category: skill.category || "general",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        percentage: parseInt(formData.percentage),
        icon: formData.icon,
        category: formData.category,
      };

      const url = editingSkill
        ? `/api/admin/skills/${editingSkill._id}`
        : "/api/admin/skills";
      const method = editingSkill ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchSkills();
      }
    } catch (error) {
      console.error("Failed to save skill:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!skillToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/skills/${skillToDelete}`, { method: "DELETE" });
      fetchSkills();
      setDeleteDialogOpen(false);
      setSkillToDelete(null);
    } catch (error) {
      console.error("Failed to delete skill:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSkillToDelete(id);
    setDeleteDialogOpen(true);
  };

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      skill.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Skills</h1>
          <p className="text-gray-400">Manage your skills and expertise</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          New Skill
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#12121a] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="bg-[#12121a] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No skills found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {categories.map((category) => (
              <div key={category} className="p-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                  {category}
                </h3>
                <div className="space-y-3">
                  {filteredSkills
                    .filter((s) => s.category === category)
                    .map((skill) => (
                      <div
                        key={skill._id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">
                              {skill.name}
                            </span>
                            <span className="text-amber-400 font-medium">
                              {skill.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.percentage}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(skill)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                            <button
                              onClick={() => handleDeleteClick(skill._id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Skill"
          description="Are you sure you want to delete this skill? This action cannot be undone."
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
              className="fixed inset-4 z-50 m-auto max-w-md max-h-[90vh] overflow-y-auto bg-[#12121a] rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingSkill ? "Edit Skill" : "New Skill"}
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    placeholder="e.g. React, TypeScript"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Proficiency: {formData.percentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Expert</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="general">General</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="database">Database</option>
                    <option value="devops">DevOps</option>
                    <option value="design">Design</option>
                    <option value="tools">Tools</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Icon (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    placeholder="Icon name or URL"
                  />
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
                  disabled={saving || !formData.name}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
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
