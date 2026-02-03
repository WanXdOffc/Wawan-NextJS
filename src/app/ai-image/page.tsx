"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Upload,
  Sparkles,
  Loader2,
  Download,
  X,
  Wand2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import { ServiceDisabled } from "@/components/ServiceDisabled";

export default function AiImagePage() {
  const { services, loading: serviceLoading } = useServiceStatus();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("prompt", prompt);

      const res = await fetch("/api/tools/gpt-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.image) {
        setResultImage(`data:image/png;base64,${data.image}`);
      } else {
        setError(data.error || "Failed to process image");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResultImage(null);
    setPrompt("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--theme-primary))]" />
      </div>
    );
  }

  if (services && !services.aiImage) {
    return <ServiceDisabled serviceName="AI Image Generator" />;
  }

  return (
    <div className="min-h-screen py-8 sm:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] mb-6">
            <Wand2 className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
            <span className="text-[hsl(var(--theme-primary))] font-medium">AI Image Editor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Transform Your <span className="gradient-text">Images</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Upload gambar dan masukkan prompt untuk mengubahnya dengan AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                previewUrl
                  ? "border-transparent"
                  : "border-border hover:border-[hsl(var(--theme-primary)/0.5)] bg-card"
              }`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain bg-black/20"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                  <div className="p-4 rounded-full bg-[hsl(var(--theme-primary)/0.1)]">
                    <Upload className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium mb-1">Drop image here or click to upload</p>
                    <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[hsl(var(--theme-primary))]" />
                Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want to transform the image... (e.g., 'make it anime style', 'change background to beach', 'add sunglasses')"
                className="min-h-[120px] resize-none"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!selectedImage || !prompt.trim() || loading}
                className="flex-1 bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate
                  </>
                )}
              </Button>
              {(selectedImage || resultImage) && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="px-4"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="aspect-square rounded-2xl border border-border bg-card overflow-hidden relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-[hsl(var(--theme-primary)/0.2)] border-t-[hsl(var(--theme-primary))] animate-spin" />
                    <Sparkles className="w-6 h-6 text-[hsl(var(--theme-primary))] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-muted-foreground text-sm">AI is working its magic...</p>
                </div>
              ) : resultImage ? (
                <>
                  <img
                    src={resultImage}
                    alt="Result"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleDownload}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--theme-primary))] text-white hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                  <div className="p-4 rounded-full bg-accent">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm text-center">
                    Result will appear here
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-card border border-border">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[hsl(var(--theme-primary))]" />
                Tips
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Be specific with your prompt for better results</li>
                <li>• Try styles like &quot;anime&quot;, &quot;ghibli&quot;, &quot;cartoon&quot;</li>
                <li>• You can change backgrounds, add objects, etc.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
