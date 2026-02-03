"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Megaphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Notification {
  _id: string;
  title: string;
  content: string;
  category: "info" | "warning" | "error" | "success" | "announcement";
  mediaType: "none" | "image" | "gif" | "audio";
  mediaUrl: string;
  showOnce: boolean;
}

const categoryConfig = {
  info: {
    icon: Info,
    bgColor: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    titleColor: "text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "from-yellow-500/20 to-orange-500/10",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    titleColor: "text-yellow-400",
  },
  error: {
    icon: AlertCircle,
    bgColor: "from-red-500/20 to-red-600/10",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    titleColor: "text-red-400",
  },
  success: {
    icon: CheckCircle,
    bgColor: "from-emerald-500/20 to-green-500/10",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    titleColor: "text-emerald-400",
  },
  announcement: {
    icon: Megaphone,
    bgColor: "from-purple-500/20 to-fuchsia-500/10",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    titleColor: "text-purple-400",
  },
};

export function NotificationPopup() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await fetch("/api/notifications/active");
        const data = await res.json();

        if (data.notification) {
          const seenKey = `notification_seen_${data.notification._id}`;
          const hasSeen = localStorage.getItem(seenKey);

          if (data.notification.showOnce && hasSeen) {
            return;
          }

          setNotification(data.notification);
          setVisible(true);

          if (data.notification.showOnce) {
            localStorage.setItem(seenKey, "true");
          }
        }
      } catch (error) {
        console.error("Failed to fetch notification:", error);
      }
    };

    fetchNotification();
  }, []);

  useEffect(() => {
    if (notification?.mediaType === "audio" && notification.mediaUrl && visible) {
      audioRef.current = new Audio(notification.mediaUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [notification, visible]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const handleClose = () => {
    setVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  if (!notification) return null;

  const config = categoryConfig[notification.category];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] mx-auto max-w-lg"
          >
            <div
              className={`relative bg-gradient-to-br ${config.bgColor} backdrop-blur-xl rounded-2xl border ${config.borderColor} shadow-2xl overflow-hidden`}
            >
              <div className="absolute inset-0 bg-[#0a0a0f]/80" />

              <div className="relative">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/5 ${config.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-lg ${config.titleColor}`}>
                      {notification.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.mediaType === "audio" && notification.mediaUrl && (
                      <button
                        onClick={toggleAudio}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        {audioPlaying ? (
                          <Volume2 className="w-5 h-5" />
                        ) : (
                          <VolumeX className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {(notification.mediaType === "image" || notification.mediaType === "gif") &&
                  notification.mediaUrl && (
                    <div className="px-4 pt-4">
                      <img
                        src={notification.mediaUrl}
                        alt="Notification media"
                        className="w-full max-h-48 object-cover rounded-xl"
                      />
                    </div>
                  )}

                <div className="p-4">
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                    <ReactMarkdown
                      components={{
                        a: ({ ...props }) => (
                          <a
                            {...props}
                            className="text-blue-400 hover:text-blue-300 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        strong: ({ ...props }) => (
                          <strong {...props} className="text-white font-semibold" />
                        ),
                        em: ({ ...props }) => (
                          <em {...props} className="text-gray-200" />
                        ),
                        code: ({ ...props }) => (
                          <code
                            {...props}
                            className="bg-white/10 px-1.5 py-0.5 rounded text-pink-400 text-sm"
                          />
                        ),
                        ul: ({ ...props }) => (
                          <ul {...props} className="list-disc list-inside space-y-1" />
                        ),
                        ol: ({ ...props }) => (
                          <ol {...props} className="list-decimal list-inside space-y-1" />
                        ),
                      }}
                    >
                      {notification.content}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button
                    onClick={handleClose}
                    className={`w-full py-3 rounded-xl font-medium transition-all bg-gradient-to-r ${config.bgColor} border ${config.borderColor} text-white hover:brightness-110`}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
