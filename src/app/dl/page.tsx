"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Music, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function DownloadRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const url = searchParams.get("url");

  useEffect(() => {
    if (!url) {
      setError("No URL provided");
      return;
    }

    const processDownload = async () => {
      try {
        const res = await fetch("/api/spotify/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, mode: "download" }),
        });

        if (!res.ok) throw new Error("Failed to process download");

        const data = await res.json();
        if (data.success && data.shortId) {
          router.push(`/dl/${data.shortId}`);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memproses unduhan. Silakan coba lagi.");
      }
    };

    processDownload();
  }, [url, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ups! Terjadi Kesalahan</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-8"
      >
        <div className="relative">
          <Music className="w-20 h-20 text-primary opacity-20" />
          <Loader2 className="w-20 h-20 text-primary absolute inset-0 animate-spin" />
        </div>
      </motion.div>
      <h2 className="text-3xl font-bold mb-4">Menyiapkan Unduhan...</h2>
      <p className="text-muted-foreground animate-pulse">
        Sedang mengunduh lagu dari Spotify dan mengunggah ke server kami.
        Mohon tunggu sebentar.
      </p>
    </div>
  );
}

export default function DownloadRedirectPage() {
  return (
    <div className="min-h-screen pt-20">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }>
        <DownloadRedirectContent />
      </Suspense>
    </div>
  );
}
