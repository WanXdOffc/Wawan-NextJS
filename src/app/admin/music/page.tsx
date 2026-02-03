"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Plus,
  Trash2,
  X,
  Check,
  Loader2,
  ExternalLink,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ConfirmDialog";

interface MusicItem {
  _id: string;
  title: string;
  artist: string;
  spotifyUrl: string;
  coverImage: string;
  duration: string;
  active: boolean;
  createdAt: string;
}

export default function AdminMusicPage() {
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      const res = await fetch("/api/admin/music");
      const data = await res.json();
      if (data.success) {
        setMusicList(data.music);
      }
    } catch (error) {
      console.error("Failed to fetch music:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddByUrl = async () => {
    if (!spotifyUrl) return;
    
    setAdding(true);
    try {
      const res = await fetch(`/api/spotify?q=${encodeURIComponent(spotifyUrl)}`);
      const data = await res.json();
      
      if (data.success && data.metadata) {
        const musicData = {
          title: data.metadata.title,
          artist: data.metadata.artist,
          spotifyUrl: data.metadata.url || spotifyUrl,
          coverImage: data.metadata.cover || "",
          duration: data.metadata.duration || "",
        };

        const saveRes = await fetch("/api/admin/music", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(musicData),
        });

        const saveData = await saveRes.json();
        if (saveData.success) {
          fetchMusic();
          setSpotifyUrl("");
        }
      }
    } catch (error) {
      console.error("Failed to add music:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/music/${confirmDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setConfirmDelete({ isOpen: false, id: "" });
        fetchMusic();
      }
    } catch (error) {
      console.error("Failed to delete music:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: "" })}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Remove Recommendation"
        description="Are you sure you want to remove this music recommendation? It will no longer be visible on the website."
        confirmText="Remove"
      />
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-violet-400" />
          <h1 className="text-3xl font-bold text-white">Music Recommendations</h1>
        </div>
        <p className="text-gray-400">Kelola playlist rekomendasi musik untuk pengunjung website</p>
      </div>

      <div className="p-6 rounded-xl bg-[#12121a] border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-violet-400" />
          <span className="font-medium text-white">Tambah ke Rekomendasi</span>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Paste link Spotify dan info lagu akan terdeteksi otomatis
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
            className="bg-[#0a0a0f] border-white/10 text-white flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddByUrl()}
          />
          <Button
            onClick={handleAddByUrl}
            disabled={adding || !spotifyUrl}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90 text-white"
          >
            {adding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Menambahkan...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Tambah
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      ) : musicList.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-[#12121a] border border-white/5">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Belum ada rekomendasi musik</p>
          <p className="text-gray-500 text-sm">Tambahkan lagu-lagu favorit untuk pengunjung website</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-gray-400 text-sm">{musicList.length} lagu dalam playlist</span>
          </div>
          <div className="space-y-2">
            {musicList.map((music, index) => (
              <motion.div
                key={music._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#12121a] border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="text-gray-600 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <span className="text-gray-500 text-sm w-6">{index + 1}</span>
                
                {music.coverImage ? (
                  <img
                    src={music.coverImage}
                    alt={music.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Music className="w-6 h-6 text-violet-400" />
                  </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-medium truncate text-sm">{music.title}</h3>
                  <p className="text-gray-400 text-xs truncate">{music.artist}</p>
                </div>

                {music.duration && (
                  <span className="text-gray-500 text-xs hidden sm:block">{music.duration}</span>
                )}

                  <div className="flex items-center gap-1">
                  <a
                    href={music.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  <button
                    onClick={() => setConfirmDelete({ isOpen: true, id: music._id })}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
