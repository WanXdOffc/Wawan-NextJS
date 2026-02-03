"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  Search,
  Download,
  ListMusic,
  Sparkles,
  Shuffle,
  Repeat,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import { ServiceDisabled } from "@/components/ServiceDisabled";

interface Song {
  title: string;
  artist: string;
  duration: string;
  cover: string;
  url: string;
}

interface MusicItem {
  _id: string;
  title: string;
  artist: string;
  spotifyUrl: string;
  coverImage: string;
  duration: string;
}

interface PreloadedTrack {
  url: string;
  audioUrl: string;
}

type TabType = "search" | "recommendations";
type ShuffleMode = "off" | "once" | "repeat";

export default function MusicPage() {
  const { services, loading: serviceLoading } = useServiceStatus();
  const [activeTab, setActiveTab] = useState<TabType>("recommendations");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffleMode, setShuffleMode] = useState<ShuffleMode>("off");
  const [preloadedTrack, setPreloadedTrack] = useState<PreloadedTrack | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
  const [playedIndices, setPlayedIndices] = useState<Set<number>>(new Set());
  const [isFromSearch, setIsFromSearch] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);
  const playlistRef = useRef<Song[]>([]);
  const currentIndexRef = useRef(-1);
  const preloadedTrackRef = useRef<PreloadedTrack | null>(null);
  const shuffleModeRef = useRef<ShuffleMode>("off");
  const shuffleOrderRef = useRef<number[]>([]);
  const playedIndicesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    preloadedTrackRef.current = preloadedTrack;
  }, [preloadedTrack]);

  useEffect(() => {
    shuffleModeRef.current = shuffleMode;
  }, [shuffleMode]);

  useEffect(() => {
    shuffleOrderRef.current = shuffleOrder;
  }, [shuffleOrder]);

  useEffect(() => {
    playedIndicesRef.current = playedIndices;
  }, [playedIndices]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const getNextIndexFromRefs = useCallback(() => {
    const pl = playlistRef.current;
    const ci = currentIndexRef.current;
    const sm = shuffleModeRef.current;
    const so = shuffleOrderRef.current;
    const pi = playedIndicesRef.current;

    if (pl.length === 0 || ci < 0) return -1;

    if (sm === "once") {
      const availableIndices = pl
        .map((_, i) => i)
        .filter((i) => !pi.has(i) && i !== ci);

      if (availableIndices.length === 0) {
        return -1;
      }

      if (so.length > 0) {
        const nextFromOrder = so.find((i) => availableIndices.includes(i));
        if (nextFromOrder !== undefined) return nextFromOrder;
      }

      return availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    if (sm === "repeat") {
      if (so.length > 0) {
        const currentOrderIdx = so.indexOf(ci);
        if (currentOrderIdx !== -1 && currentOrderIdx < so.length - 1) {
          return so[currentOrderIdx + 1];
        }
        return so[0];
      }
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * pl.length);
      } while (randomIndex === ci && pl.length > 1);
      return randomIndex;
    }

    return (ci + 1) % pl.length;
  }, []);

  const generateSimpleShuffleOrder = useCallback((length: number, startIndex: number) => {
    const indices = Array.from({ length }, (_, i) => i).filter(i => i !== startIndex);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return [startIndex, ...indices];
  }, []);

  const handleToggleShuffle = () => {
    let nextMode: ShuffleMode;
    if (shuffleMode === "off") {
      nextMode = "once";
    } else if (shuffleMode === "once") {
      nextMode = "repeat";
    } else {
      nextMode = "off";
    }

    setShuffleMode(nextMode);
    setPreloadedTrack(null);

    if (nextMode === "off") {
      setShuffleOrder([]);
      setPlayedIndices(new Set());
    } else if (nextMode === "once") {
      setPlayedIndices(new Set(currentIndex >= 0 ? [currentIndex] : []));
      if (playlist.length > 0 && currentIndex >= 0) {
        const order = generateSimpleShuffleOrder(playlist.length, currentIndex);
        setShuffleOrder(order);
      }
    } else if (nextMode === "repeat") {
      setPlayedIndices(new Set());
      if (playlist.length > 0 && currentIndex >= 0) {
        const order = generateSimpleShuffleOrder(playlist.length, currentIndex);
        setShuffleOrder(order);
      }
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch("/api/music");
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.music);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const preloadNextTrack = useCallback(async () => {
    const pl = playlistRef.current;
    const ci = currentIndexRef.current;
    
    if (pl.length === 0 || ci < 0 || isPreloading) return;

    const nextIndex = getNextIndexFromRefs();
    if (nextIndex < 0) return;

    const nextSong = pl[nextIndex];
    if (!nextSong || preloadedTrackRef.current?.url === nextSong.url) return;

    setIsPreloading(true);
    try {
      const res = await fetch("/api/spotify/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: nextSong.url, mode: "player" }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

        const data = await res.json();

        if (data.success && data.audio) {
          const bin = atob(data.audio);
          const len = bin.length;
          const arr = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            arr[i] = bin.charCodeAt(i);
          }
          const audioBlob = new Blob([arr], { type: "audio/mpeg" });
          const audioUrl = URL.createObjectURL(audioBlob);
          setPreloadedTrack({ url: nextSong.url, audioUrl });
        }
    } catch (error) {
      console.error("Failed to preload:", error);
    } finally {
      setIsPreloading(false);
    }
  }, [isPreloading, getNextIndexFromRefs]);

  useEffect(() => {
    if (currentTime >= 5 && !preloadedTrack && !isPreloading && playlist.length > 0 && currentIndex >= 0) {
      preloadNextTrack();
    }
  }, [currentTime, preloadedTrack, isPreloading, preloadNextTrack, playlist.length, currentIndex]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.songs) {
        setSearchResults(data.songs);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  const playAudioFromUrl = useCallback(async (audioUrl: string) => {
    if (!audioRef.current) return;
    
    try {
      audioRef.current.pause();
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  }, []);

  const loadAndPlaySong = useCallback(async (song: Song): Promise<boolean> => {
    setLoadingTrack(true);
    
    try {
      const res = await fetch("/api/spotify/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: song.url, mode: "player" }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();

      if (data.success && data.audio) {
        const bin = atob(data.audio);
        const len = bin.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          arr[i] = bin.charCodeAt(i);
        }
        const audioBlob = new Blob([arr], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        await playAudioFromUrl(audioUrl);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load song:", error);
      return false;
    } finally {
      setLoadingTrack(false);
    }
  }, [playAudioFromUrl]);

  const playSong = useCallback(async (
    song: Song,
    index: number = -1,
    list: Song[] = [],
    usePreloaded: boolean = false,
    fromSearch: boolean = false,
    searchQ: string = ""
  ) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setCurrentSong(song);
    setIsFromSearch(fromSearch);
    if (searchQ) setLastSearchQuery(searchQ);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    if (list.length > 0) {
      setPlaylist(list);
      playlistRef.current = list;
      setCurrentIndex(index);
      currentIndexRef.current = index;

      if (shuffleModeRef.current === "once") {
        const newPlayed = new Set([index]);
        setPlayedIndices(newPlayed);
        playedIndicesRef.current = newPlayed;
      }

      if (shuffleModeRef.current !== "off") {
        const order = generateSimpleShuffleOrder(list.length, index);
        setShuffleOrder(order);
        shuffleOrderRef.current = order;
      }
    } else if (index >= 0) {
      setCurrentIndex(index);
      currentIndexRef.current = index;
      if (shuffleModeRef.current === "once") {
        const newPlayed = new Set([...playedIndicesRef.current, index]);
        setPlayedIndices(newPlayed);
        playedIndicesRef.current = newPlayed;
      }
    }

    setPreloadedTrack(null);
    preloadedTrackRef.current = null;

    if (usePreloaded && preloadedTrackRef.current?.url === song.url) {
      await playAudioFromUrl(preloadedTrackRef.current.audioUrl);
      isTransitioningRef.current = false;
      return;
    }

    await loadAndPlaySong(song);
    isTransitioningRef.current = false;
  }, [generateSimpleShuffleOrder, playAudioFromUrl, loadAndPlaySong]);

  const playFromRecommendations = useCallback((music: MusicItem, index: number) => {
    const song: Song = {
      title: music.title,
      artist: music.artist,
      duration: music.duration,
      cover: music.coverImage,
      url: music.spotifyUrl,
    };
    const list = recommendations.map((m) => ({
      title: m.title,
      artist: m.artist,
      duration: m.duration,
      cover: m.coverImage,
      url: m.spotifyUrl,
    }));
    playSong(song, index, list, false, false);
  }, [recommendations, playSong]);

  const downloadSong = async (song: Song) => {
    setDownloading(song.url);
    try {
      const res = await fetch("/api/spotify/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: song.url, mode: "download" }),
      });
      const data = await res.json();
      if (data.success && data.shortId) {
        window.location.href = `/dl/${data.shortId}`;
      } else {
        window.location.href = `/dl?url=${encodeURIComponent(song.url)}`;
      }
    } catch (error) {
      console.error("Download failed:", error);
      window.location.href = `/dl?url=${encodeURIComponent(song.url)}`;
    } finally {
      setDownloading(null);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const handleNext = useCallback(async () => {
    if (isTransitioningRef.current) return;
    
    const pl = playlistRef.current;
    const ci = currentIndexRef.current;
    
    if (pl.length === 0 || ci < 0) return;

    const nextIndex = getNextIndexFromRefs();

    if (nextIndex < 0) {
      const newPlayed = new Set<number>();
      setPlayedIndices(newPlayed);
      playedIndicesRef.current = newPlayed;
      
      const firstIndex = shuffleOrderRef.current.length > 0 ? shuffleOrderRef.current[0] : 0;
      await playSong(pl[firstIndex], firstIndex, [], false, isFromSearch, lastSearchQuery);
      return;
    }

    const nextSong = pl[nextIndex];
    const preloaded = preloadedTrackRef.current;
    const usePreloaded = preloaded?.url === nextSong.url;

    if (shuffleModeRef.current === "once") {
      const newPlayed = new Set([...playedIndicesRef.current, nextIndex]);
      setPlayedIndices(newPlayed);
      playedIndicesRef.current = newPlayed;
    }

    setCurrentSong(nextSong);
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    if (usePreloaded && preloaded) {
      setPreloadedTrack(null);
      preloadedTrackRef.current = null;
      await playAudioFromUrl(preloaded.audioUrl);
    } else {
      setPreloadedTrack(null);
      preloadedTrackRef.current = null;
      await loadAndPlaySong(nextSong);
    }
  }, [getNextIndexFromRefs, isFromSearch, lastSearchQuery, playSong, playAudioFromUrl, loadAndPlaySong]);

  const handlePrev = useCallback(() => {
    const pl = playlistRef.current;
    const ci = currentIndexRef.current;
    
    if (pl.length > 0 && ci >= 0) {
      const prevIndex = ci === 0 ? pl.length - 1 : ci - 1;
      playSong(pl[prevIndex], prevIndex, [], false, isFromSearch, lastSearchQuery);
    }
  }, [playSong, isFromSearch, lastSearchQuery]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    const pl = playlistRef.current;
    const ci = currentIndexRef.current;
    
    if (ci >= 0 && pl.length > 0) {
      handleNext();
    }
  }, [handleNext]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getShuffleIcon = () => {
    if (shuffleMode === "repeat") {
      return (
        <div className="relative">
          <Shuffle className="w-5 h-5" />
          <Repeat className="w-3 h-3 absolute -bottom-1 -right-1" />
        </div>
      );
    }
    return <Shuffle className="w-5 h-5" />;
  };

  const getShuffleTitle = () => {
    if (shuffleMode === "off") return "Shuffle: Off";
    if (shuffleMode === "once") return "Shuffle: No Repeat (lagu tidak akan diputar ulang)";
    return "Shuffle: With Repeat (lagu bisa diputar ulang)";
  };

  if (serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--theme-primary))]" />
      </div>
    );
  }

  if (services && !services.musicPlayer) {
    return <ServiceDisabled serviceName="Music Player" />;
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
            <Music className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
            <span className="text-[hsl(var(--theme-primary))] font-medium">Music Player</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Play <span className="gradient-text">Music</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Cari lagu favoritmu atau dengarkan rekomendasi dari kami
          </p>
        </motion.div>

        {currentSong && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[hsl(var(--theme-primary)/0.15)] via-[hsl(var(--theme-accent)/0.08)] to-[hsl(var(--theme-secondary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)]">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative flex-shrink-0">
                    {currentSong.cover ? (
                      <img
                        key={currentSong.url}
                        src={currentSong.cover}
                        alt={currentSong.title}
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover shadow-2xl"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-gradient-to-br from-[hsl(var(--theme-primary)/0.3)] to-[hsl(var(--theme-accent)/0.3)] flex items-center justify-center">
                        <Music className="w-12 h-12 text-[hsl(var(--theme-primary))]" />
                      </div>
                    )}
                    {isPlaying && (
                      <div className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8">
                        <svg viewBox="0 0 32 32" className="w-full h-full">
                          <circle
                            cx="16"
                            cy="16"
                            r="14"
                            fill="hsl(var(--theme-primary))"
                            className="opacity-90"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="5"
                            fill="hsl(var(--background))"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="2"
                            fill="hsl(var(--theme-primary))"
                          />
                          <line
                            x1="16"
                            y1="2"
                            x2="16"
                            y2="6"
                            stroke="hsl(var(--background))"
                            strokeWidth="1"
                            className="origin-center"
                            style={{
                              animation: "spin 2s linear infinite",
                            }}
                          />
                        </svg>
                        <style jsx>{`
                          @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                          }
                        `}</style>
                      </div>
                    )}
                  </div>

                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1">{currentSong.title}</h3>
                  <p className="text-muted-foreground mb-4">{currentSong.artist}</p>

                  <div className="space-y-2 w-full">
                    <Slider
                      value={[progress]}
                      max={100}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

                <div className="flex items-center justify-center mt-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={handleToggleShuffle}
                      className={`p-2 sm:p-3 rounded-full transition-colors relative ${
                        shuffleMode !== "off"
                          ? "bg-[hsl(var(--theme-primary)/0.3)] text-[hsl(var(--theme-primary))]"
                          : "hover:bg-white/10"
                      }`}
                      title={getShuffleTitle()}
                    >
                      {getShuffleIcon()}
                      {shuffleMode !== "off" && (
                        <div
                          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                            shuffleMode === "once"
                              ? "bg-[hsl(var(--theme-primary))]"
                              : "bg-[hsl(var(--theme-accent))]"
                          }`}
                        >
                          {shuffleMode === "once" ? "1" : "∞"}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex < 0}
                      className="p-2 sm:p-3 rounded-full hover:bg-white/10 disabled:opacity-50 transition-colors"
                    >
                      <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={togglePlay}
                      disabled={loadingTrack}
                      className="p-3 sm:p-4 rounded-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white shadow-lg hover:opacity-90 transition-opacity"
                    >
                      {loadingTrack ? (
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
                      ) : (
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex < 0}
                      className="p-2 sm:p-3 rounded-full hover:bg-white/10 disabled:opacity-50 transition-colors"
                    >
                      <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={() => downloadSong(currentSong)}
                      disabled={downloading === currentSong.url}
                      className="p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors"
                      title="Download"
                    >
                      {downloading === currentSong.url ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                  <Slider
                    value={[volume]}
                    max={100}
                    onValueChange={(v) => setVolume(v[0])}
                    className="w-28 sm:w-32"
                  />
                </div>

              {shuffleMode !== "off" && playlist.length > 0 && (
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  {shuffleMode === "once" ? (
                    <span>
                      {playedIndices.size} / {playlist.length} lagu telah diputar
                    </span>
                  ) : (
                    <span>Shuffle dengan pengulangan aktif</span>
                  )}
                </div>
              )}

              {isPreloading && (
                <div className="mt-2 text-center text-xs text-muted-foreground/50">
                  Memuat lagu berikutnya...
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-2 p-1 rounded-xl bg-card border border-border w-fit mx-auto">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "recommendations"
                  ? "bg-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Rekomendasi
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "search"
                  ? "bg-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="w-4 h-4" />
              Cari Lagu
            </button>
          </div>
        </motion.div>

        {activeTab === "search" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lagu, artis, atau paste link Spotify..."
                className="pl-12 py-6 text-base rounded-xl"
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === "search" ? (
            loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--theme-primary))]" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((song, index) => (
                  <motion.div
                    key={`${song.url}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all group ${
                      currentSong?.url === song.url
                        ? "bg-gradient-to-r from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.1)] border border-[hsl(var(--theme-primary)/0.3)]"
                        : "bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.3)]"
                    }`}
                  >
                    <div
                      className="relative flex-shrink-0"
                      onClick={() =>
                        playSong(song, index, searchResults, false, true, searchQuery)
                      }
                    >
                      {song.cover ? (
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[hsl(var(--theme-primary)/0.2)] flex items-center justify-center">
                          <Music className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div
                      className="flex-1 min-w-0"
                      onClick={() =>
                        playSong(song, index, searchResults, false, true, searchQuery)
                      }
                    >
                      <h3 className="font-semibold truncate">{song.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    {song.duration && (
                      <span className="text-sm text-muted-foreground hidden sm:block">
                        {song.duration}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSong(song);
                      }}
                      disabled={downloading === song.url}
                      className="p-2 rounded-lg hover:bg-[hsl(var(--theme-primary)/0.2)] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {downloading === song.url ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Cari lagu atau paste link Spotify untuk mulai
                </p>
              </div>
            )
          ) : loadingRecs ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--theme-primary))]" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-2">
              {recommendations.map((music, index) => (
                <motion.div
                  key={music._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all group ${
                    currentSong?.url === music.spotifyUrl
                      ? "bg-gradient-to-r from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.1)] border border-[hsl(var(--theme-primary)/0.3)]"
                      : "bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.3)]"
                  }`}
                >
                  <div
                    className="relative flex-shrink-0"
                    onClick={() => playFromRecommendations(music, index)}
                  >
                    {music.coverImage ? (
                      <img
                        src={music.coverImage}
                        alt={music.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[hsl(var(--theme-primary)/0.2)] flex items-center justify-center">
                        <Music className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentSong?.url === music.spotifyUrl && isPlaying ? (
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-white rounded-full"
                              animate={{ height: [8, 16, 8] }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => playFromRecommendations(music, index)}
                  >
                    <h3 className="font-semibold truncate">{music.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{music.artist}</p>
                  </div>
                  {music.duration && (
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {music.duration}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSong({
                        title: music.title,
                        artist: music.artist,
                        duration: music.duration,
                        cover: music.coverImage,
                        url: music.spotifyUrl,
                      });
                    }}
                    disabled={downloading === music.spotifyUrl}
                    className="p-2 rounded-lg hover:bg-[hsl(var(--theme-primary)/0.2)] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {downloading === music.spotifyUrl ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-card border border-border">
              <ListMusic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada rekomendasi musik</p>
            </div>
          )}
        </motion.div>

        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="auto"
        />
      </div>
    </div>
  );
}
