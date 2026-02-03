"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Code2,
  Lock,
  Unlock,
  Eye,
  ChevronDown,
  Terminal,
  Filter,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import { ServiceDisabled } from "@/components/ServiceDisabled";

interface LibraryCode {
  _id: string;
  title: string;
  description: string;
  progLanguage: string;
  hashtags: string[];
  accessType: "free" | "password";
  downloadType?: "code" | "zip";
  views: number;
  createdAt: string;
}

export function LibraryContent() {
  const { services, loading: serviceLoading } = useServiceStatus();
  const [codes, setCodes] = useState<LibraryCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedHashtag, setSelectedHashtag] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [hashtagOpen, setHashtagOpen] = useState(false);

  const fetchCodes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedLanguage) params.set("language", selectedLanguage);
      if (selectedHashtag) params.set("hashtag", selectedHashtag);

      const res = await fetch(`/api/library?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setCodes(data.data || []);
        setLanguages(data.filters?.languages || []);
        setHashtags(data.filters?.hashtags || []);
      }
    } catch (error) {
      console.error("Failed to fetch library:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedLanguage, selectedHashtag]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  if (serviceLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (services && !services.library) {
    return <ServiceDisabled serviceName="Code Library" />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <Terminal className="w-4 h-4" />
            Code Library
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-3">
            Code <span className="gradient-text">Library</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse and download code snippets, scripts, and resources
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => { setLanguageOpen(!languageOpen); setHashtagOpen(false); }}
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3 bg-card border border-border rounded-xl text-foreground hover:border-violet-500/50 transition-colors min-w-[160px]"
            >
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                {selectedLanguage || "Language"}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${languageOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {languageOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 top-full mt-2 w-full sm:w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => { setSelectedLanguage(""); setLanguageOpen(false); }}
                    className="w-full px-4 py-2 text-left text-muted-foreground hover:bg-accent transition-colors"
                  >
                    All Languages
                  </button>
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLanguage(lang); setLanguageOpen(false); }}
                      className={`w-full px-4 py-2 text-left hover:bg-accent transition-colors ${
                        selectedLanguage === lang ? "text-violet-400 bg-violet-500/10" : "text-foreground"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => { setHashtagOpen(!hashtagOpen); setLanguageOpen(false); }}
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3 bg-card border border-border rounded-xl text-foreground hover:border-violet-500/50 transition-colors min-w-[160px]"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {selectedHashtag ? `#${selectedHashtag}` : "Hashtag"}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${hashtagOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {hashtagOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 top-full mt-2 w-full sm:w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
                >
                  <button
                    onClick={() => { setSelectedHashtag(""); setHashtagOpen(false); }}
                    className="w-full px-4 py-2 text-left text-muted-foreground hover:bg-accent transition-colors"
                  >
                    All Tags
                  </button>
                  {hashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSelectedHashtag(tag); setHashtagOpen(false); }}
                      className={`w-full px-4 py-2 text-left hover:bg-accent transition-colors ${
                        selectedHashtag === tag ? "text-violet-400 bg-violet-500/10" : "text-foreground"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-20">
            <Code2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No codes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {codes.map((code, index) => (
              <motion.div
                key={code._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/library/${code._id}`}>
                  <div className="group cursor-pointer bg-card rounded-xl border border-border hover:border-violet-500/50 overflow-hidden transition-all hover:shadow-lg hover:shadow-violet-500/5 h-full">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-violet-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-violet-400 transition-colors line-clamp-1">
                              {code.title}
                            </h3>
                            <span className="text-xs text-muted-foreground">{code.progLanguage}</span>
                          </div>
                        </div>
                        {code.accessType === "password" ? (
                          <Lock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Unlock className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {code.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {code.hashtags?.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-violet-500/10 text-violet-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Eye className="w-3 h-3" />
                          {code.views}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-muted/50 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {code.downloadType === "zip" ? "ZIP Archive" : "Code Snippet"}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
