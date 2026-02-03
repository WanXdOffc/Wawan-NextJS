"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Plus,
  Trash2,
  Save,
  QrCode,
  Building2,
  Wallet,
  Edit2,
  Eye,
  Check,
  X,
  Upload,
  AlertCircle,
  Users,
  Smartphone,
  Bitcoin,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";

interface PaymentMethod {
  _id?: string;
  type: string;
  name: string;
  value: string;
  accountName: string;
  qrisImage: string;
  enabled: boolean;
}

interface DonationSubmission {
  _id: string;
  name: string;
  paymentMethod: string;
  nominal: number;
  screenshot: string;
  message: string;
  status: "pending" | "verified" | "rejected";
  createdAt: string;
}

export default function AdminDonationPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [submissions, setSubmissions] = useState<DonationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "submissions">("settings");
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethod, setNewMethod] = useState<PaymentMethod>({
    type: "qris",
    name: "",
    value: "",
    accountName: "",
    qrisImage: "",
    enabled: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; index: number | null }>({
    isOpen: false,
    index: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, submissionsRes] = await Promise.all([
        fetch("/api/donation"),
        fetch("/api/donation/submit"),
      ]);
      const settingsData = await settingsRes.json();
      const submissionsData = await submissionsRes.json();

      if (settingsData.success) {
        setPaymentMethods(settingsData.data.paymentMethods || []);
        setThankYouMessage(settingsData.data.thankYouMessage || "");
      }
      if (submissionsData.success) {
        setSubmissions(submissionsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethods,
          thankYouMessage,
        }),
      });
    } catch (error) {
      console.error("Error saving:", error);
    }
    setSaving(false);
  };

  const handleAddMethod = () => {
    if (!newMethod.name || !newMethod.value) return;
    setPaymentMethods([...paymentMethods, { ...newMethod, _id: Date.now().toString() }]);
    setNewMethod({ type: "qris", name: "", value: "", accountName: "", qrisImage: "", enabled: true });
    setShowAddModal(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.index === null) return;
    setPaymentMethods(paymentMethods.filter((_, i) => i !== deleteConfirm.index));
    setDeleteConfirm({ isOpen: false, index: null });
  };

  const handleDeleteClick = (index: number) => {
    setDeleteConfirm({ isOpen: true, index });
  };

  const handleToggleMethod = (index: number) => {
    const updated = [...paymentMethods];
    updated[index].enabled = !updated[index].enabled;
    setPaymentMethods(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editingMethod) {
          setEditingMethod({ ...editingMethod, qrisImage: reader.result as string });
        } else {
          setNewMethod({ ...newMethod, qrisImage: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSubmissionStatus = async (id: string, status: "verified" | "rejected") => {
    try {
      await fetch(`/api/donation/submit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setSubmissions(submissions.map((s) => (s._id === id ? { ...s, status } : s)));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const paymentTypes = [
    { id: "qris", label: "QRIS", icon: QrCode },
    { id: "bank", label: "Bank Transfer", icon: Building2 },
    { id: "ewallet", label: "E-Wallet", icon: Wallet },
    { id: "pulsa", label: "Pulsa", icon: Smartphone },
    { id: "crypto", label: "Crypto", icon: Bitcoin },
    { id: "international", label: "International", icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500" />
              Donation Settings
            </h1>
            <p className="text-gray-400 mt-1">Manage payment methods and donation submissions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/donate" target="_blank">
              <Button variant="outline" className="border-white/10">
                <Eye className="w-4 h-4 mr-2" />
                Preview Page
              </Button>
            </Link>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
            >
              {saving ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "settings"
                ? "bg-pink-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "submissions"
                ? "bg-pink-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Submissions
            {submissions.filter((s) => s.status === "pending").length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-xs">
                {submissions.filter((s) => s.status === "pending").length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "settings" ? (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Thank You Message
              </label>
              <textarea
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50"
                placeholder="Terima kasih atas dukungannya!"
              />
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Payment Methods</h2>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-pink-500 to-rose-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Method
                </Button>
              </div>

              <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No payment methods added yet</p>
                    <p className="text-sm">Click "Add Method" to get started</p>
                  </div>
                ) : (
                  paymentMethods.map((method, index) => (
                    <motion.div
                      key={method._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border transition-all ${
                        method.enabled
                          ? "bg-white/5 border-white/10"
                          : "bg-white/[0.02] border-white/5 opacity-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-3 rounded-xl ${
                                method.type === "qris"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : method.type === "bank"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : method.type === "ewallet"
                                  ? "bg-green-500/20 text-green-400"
                                  : method.type === "pulsa"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : method.type === "crypto"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-cyan-500/20 text-cyan-400"
                              }`}
                            >
                              {method.type === "qris" && <QrCode className="w-5 h-5" />}
                              {method.type === "bank" && <Building2 className="w-5 h-5" />}
                              {method.type === "ewallet" && <Wallet className="w-5 h-5" />}
                              {method.type === "pulsa" && <Smartphone className="w-5 h-5" />}
                              {method.type === "crypto" && <Bitcoin className="w-5 h-5" />}
                              {method.type === "international" && <CreditCard className="w-5 h-5" />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{method.name}</h3>
                              <p className="text-sm text-gray-400">
                                {method.type === "qris" ? "QRIS" : method.value}
                              </p>
                              {method.accountName && (
                                <p className="text-sm text-gray-500">A/n: {method.accountName}</p>
                              )}
                              {method.type === "qris" && method.qrisImage && (
                              <img
                                src={method.qrisImage}
                                alt="QRIS"
                                className="mt-2 max-w-[100px] rounded-lg"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleMethod(index)}
                            className={`p-2 rounded-lg transition-colors ${
                              method.enabled
                                ? "bg-green-500/20 text-green-400"
                                : "bg-white/5 text-gray-500"
                            }`}
                          >
                            {method.enabled ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(index)}
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <ConfirmDialog
              isOpen={deleteConfirm.isOpen}
              onClose={() => setDeleteConfirm({ isOpen: false, index: null })}
              onConfirm={handleConfirmDelete}
              title="Hapus Metode Pembayaran?"
              description="Yakin ingin menghapus metode pembayaran ini?"
              confirmText="Hapus"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No donation submissions yet</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <motion.div
                  key={submission._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {submission.screenshot && (
                        <img
                          src={submission.screenshot}
                          alt="Screenshot"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{submission.name}</h3>
                        <p className="text-sm text-gray-400">
                          {submission.paymentMethod} • Rp{" "}
                          {submission.nominal.toLocaleString()}
                        </p>
                        {submission.message && (
                          <p className="text-sm text-gray-500 mt-1">
                            "{submission.message}"
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.status === "pending" ? (
                        <>
                          <Button
                            onClick={() => updateSubmissionStatus(submission._id, "verified")}
                            size="sm"
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            onClick={() => updateSubmissionStatus(submission._id, "rejected")}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            submission.status === "verified"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {submission.status}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        <AnimatePresence>
          {(showAddModal || editingMethod) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setShowAddModal(false);
                setEditingMethod(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 rounded-2xl bg-[#0f0f0f] border border-white/10"
              >
                <h2 className="text-xl font-bold text-white mb-6">
                  {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                    <div className="flex gap-2">
                      {paymentTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            if (editingMethod) {
                              setEditingMethod({ ...editingMethod, type: type.id });
                            } else {
                              setNewMethod({ ...newMethod, type: type.id });
                            }
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                            (editingMethod ? editingMethod.type : newMethod.type) === type.id
                              ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                              : "bg-white/5 border-white/10 text-gray-400"
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          <span className="text-sm">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={editingMethod ? editingMethod.name : newMethod.name}
                      onChange={(e) => {
                        if (editingMethod) {
                          setEditingMethod({ ...editingMethod, name: e.target.value });
                        } else {
                          setNewMethod({ ...newMethod, name: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50"
                      placeholder="BCA, GoPay, QRIS, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      {(editingMethod ? editingMethod.type : newMethod.type) === "qris"
                        ? "QRIS Name/Label"
                        : "Account Number / Phone"}
                    </label>
                    <input
                      type="text"
                      value={editingMethod ? editingMethod.value : newMethod.value}
                      onChange={(e) => {
                        if (editingMethod) {
                          setEditingMethod({ ...editingMethod, value: e.target.value });
                        } else {
                          setNewMethod({ ...newMethod, value: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50"
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Atas Nama (A/n)
                      </label>
                      <input
                        type="text"
                        value={editingMethod ? editingMethod.accountName : newMethod.accountName}
                        onChange={(e) => {
                          if (editingMethod) {
                            setEditingMethod({ ...editingMethod, accountName: e.target.value });
                          } else {
                            setNewMethod({ ...newMethod, accountName: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50"
                        placeholder="Nama pemilik rekening"
                      />
                    </div>

                    {(editingMethod ? editingMethod.type : newMethod.type) === "qris" && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">QRIS Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, !!editingMethod)}
                        className="hidden"
                        id="qris-upload"
                      />
                      <label
                        htmlFor="qris-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-pink-500/50 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload QRIS Image</span>
                      </label>
                      {(editingMethod?.qrisImage || newMethod.qrisImage) && (
                        <img
                          src={editingMethod?.qrisImage || newMethod.qrisImage}
                          alt="QRIS Preview"
                          className="mt-2 max-w-[150px] rounded-lg mx-auto"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMethod(null);
                    }}
                    variant="outline"
                    className="flex-1 border-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingMethod) {
                        const index = paymentMethods.findIndex(
                          (m) => m._id === editingMethod._id
                        );
                        if (index !== -1) {
                          const updated = [...paymentMethods];
                          updated[index] = editingMethod;
                          setPaymentMethods(updated);
                        }
                        setEditingMethod(null);
                      } else {
                        handleAddMethod();
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                  >
                    {editingMethod ? "Save" : "Add"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
