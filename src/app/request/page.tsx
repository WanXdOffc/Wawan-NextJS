"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  ImagePlus, 
  X, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Minus,
  Square,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function RequestPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Screenshot maksimal 5MB");
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !request.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("request", request.trim());
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim request");
      }

      setSuccess(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim request");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-xl overflow-hidden border border-[#3d3d3d] bg-[#1e1e1e] shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-[#3d3d3d]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57] flex items-center justify-center">
                  <X className="w-2 h-2 text-[#990000] opacity-0 group-hover:opacity-100" />
                </div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e] flex items-center justify-center">
                  <Minus className="w-2 h-2 text-[#985700] opacity-0 group-hover:opacity-100" />
                </div>
                <div className="w-3 h-3 rounded-full bg-[#28c840] flex items-center justify-center">
                  <Square className="w-1.5 h-1.5 text-[#0a6617] opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <span className="flex-1 text-center text-sm text-gray-400 font-mono">request_success.sh</span>
            </div>
            
            <div className="p-8 text-center font-mono">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#28c840]/20 border border-[#28c840]/50 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-[#28c840]" />
              </motion.div>
              
              <div className="space-y-2 text-left mb-8">
                <p className="text-gray-400">
                  <span className="text-[#28c840]">$</span> submit --request
                </p>
                <p className="text-[#28c840]">
                  ✓ Request submitted successfully!
                </p>
                <p className="text-gray-400 mt-4">
                  <span className="text-[#febc2e]">→</span> Terima kasih atas masukanmu.
                </p>
                <p className="text-gray-400">
                  <span className="text-[#febc2e]">→</span> Kami akan review request-mu secepatnya.
                </p>
              </div>
              
              <Link href="/">
                <Button className="rounded-lg bg-[#3d3d3d] hover:bg-[#4d4d4d] text-white font-mono">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  cd ~
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden border border-[#3d3d3d] bg-[#1e1e1e] shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-[#3d3d3d]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="flex-1 text-center text-sm text-gray-400 font-mono">feature_request.sh — bash</span>
          </div>

          <div className="p-6 font-mono text-sm">
            <div className="mb-6">
              <p className="text-gray-400 mb-1">
                <span className="text-[#28c840]">user@wanyzx</span>:<span className="text-[#569cd6]">~/request</span>$ cat welcome.txt
              </p>
              <div className="pl-4 border-l-2 border-[#3d3d3d] text-gray-300 space-y-1">
                <p>Punya ide atau saran untuk website ini?</p>
                <p>Kirimkan requestmu dan bantu kami berkembang!</p>
                <p className="text-[#febc2e]">⚠ Max 2 request per 24 jam</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 block mb-2">
                  <span className="text-[#28c840]">$</span> read -p &quot;Nama: &quot; <span className="text-[#ce9178]">NAME</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan namamu..."
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-lg bg-[#2d2d2d] border border-[#3d3d3d] focus:border-[#569cd6] focus:ring-1 focus:ring-[#569cd6] transition-all outline-none text-white placeholder-gray-500 font-mono"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-2">
                  <span className="text-[#28c840]">$</span> read -p &quot;Email: &quot; <span className="text-[#ce9178]">EMAIL</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-[#2d2d2d] border border-[#3d3d3d] focus:border-[#569cd6] focus:ring-1 focus:ring-[#569cd6] transition-all outline-none text-white placeholder-gray-500 font-mono"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-2">
                  <span className="text-[#28c840]">$</span> cat &gt;&gt; <span className="text-[#ce9178]">REQUEST.md</span>
                </label>
                <textarea
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="# Jelaskan fitur atau perubahan yang kamu inginkan..."
                  rows={5}
                  maxLength={2000}
                  className="w-full px-4 py-3 rounded-lg bg-[#2d2d2d] border border-[#3d3d3d] focus:border-[#569cd6] focus:ring-1 focus:ring-[#569cd6] transition-all outline-none text-white placeholder-gray-500 font-mono resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1 text-right font-mono">
                  {request.length}/2000 chars
                </p>
              </div>

              <div>
                <label className="text-gray-400 block mb-2">
                  <span className="text-[#28c840]">$</span> upload <span className="text-gray-500">--optional</span> <span className="text-[#ce9178]">SCREENSHOT</span>
                </label>
                
                <AnimatePresence mode="wait">
                  {screenshotPreview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative rounded-lg overflow-hidden border border-[#3d3d3d]"
                    >
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-[#ff5f57] hover:bg-[#ff5f57]/80 text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/70 text-xs text-gray-300">
                        <span className="text-[#28c840]">✓</span> {screenshot?.name}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleScreenshotChange}
                        className="hidden"
                        id="screenshot-input"
                        disabled={loading}
                      />
                      <label
                        htmlFor="screenshot-input"
                        className="flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed border-[#3d3d3d] hover:border-[#569cd6] hover:bg-[#2d2d2d] transition-all cursor-pointer"
                      >
                        <ImagePlus className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-500">
                          Drag & drop atau klik untuk upload
                        </span>
                        <span className="text-xs text-gray-600 mt-1">
                          Max 5MB • JPEG, PNG, GIF, WebP
                        </span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-4 border-t border-[#3d3d3d]">
                <p className="text-gray-400 mb-4">
                  <span className="text-[#28c840]">$</span> ./submit.sh --validate --send
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 rounded-lg bg-gradient-to-r from-[#28c840] to-[#20a335] hover:from-[#32d24a] hover:to-[#28c840] text-black font-bold text-base font-mono"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            cd ~/home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
