"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Terminal,
  Play,
  Download,
  Hash,
  Loader2,
  ArrowLeft,
  Eye,
  Calendar,
  Share2,
} from "lucide-react";
import Link from "next/link";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { toast } from "sonner";

interface CodeData {
  _id: string;
  title: string;
  description: string;
  language: string;
  hashtags: string[];
  code: string;
  exampleUsage?: string;
  output?: string;
  accessType: "free" | "password";
  downloadUrl?: string;
  downloadType?: "code" | "zip";
  views: number;
  createdAt: string;
}

interface CodeMeta {
  _id: string;
  title: string;
  description: string;
  progLanguage: string;
  hashtags: string[];
  accessType: "free" | "password";
  views: number;
  createdAt: string;
}

function TerminalWindow({ 
  title, 
  children, 
  language,
  onCopy,
  copied 
}: { 
  title: string; 
  children: React.ReactNode;
  language?: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117] shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-3 text-xs text-gray-400 font-mono">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {language && (
            <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-gray-400">
              {language}
            </span>
          )}
          {onCopy && (
            <button
              onClick={onCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-auto max-h-[600px]">
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const langMap: Record<string, string> = {
    "JavaScript": "javascript",
    "TypeScript": "typescript",
    "Python": "python",
    "PHP": "php",
    "Java": "java",
    "C++": "cpp",
    "C#": "csharp",
    "Go": "go",
    "Rust": "rust",
    "Ruby": "ruby",
    "Swift": "swift",
    "Kotlin": "kotlin",
    "Dart": "dart",
    "HTML": "html",
    "CSS": "css",
    "SCSS": "scss",
    "SQL": "sql",
    "Shell": "bash",
    "Bash": "bash",
    "PowerShell": "powershell",
    "JSON": "json",
    "YAML": "yaml",
    "Markdown": "markdown",
  };

  const hljsLang = langMap[language] || "plaintext";
  let highlighted: string;
  
  try {
    highlighted = hljs.highlight(code, { language: hljsLang }).value;
  } catch {
    highlighted = hljs.highlightAuto(code).value;
  }

  return (
    <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
      <code 
        className="hljs"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </pre>
  );
}

export function LibraryDetailContent({ id }: { id: string }) {
  const [meta, setMeta] = useState<CodeMeta | null>(null);
  const [codeData, setCodeData] = useState<CodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [shareClicked, setShareClicked] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareClicked(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setShareClicked(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const unlockCode = useCallback(async (pwd?: string) => {
    setUnlocking(true);
    setPasswordError("");
    
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: pwd }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setCodeData(data.data);
      } else {
        setPasswordError(data.error || "Failed to unlock");
      }
    } catch {
      setPasswordError("Failed to unlock code");
    } finally {
      setUnlocking(false);
    }
  }, [id]);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch(`/api/library?search=&limit=100`);
      const data = await res.json();
      if (data.success) {
        const found = data.data.find((c: CodeMeta) => c._id === id);
        if (found) {
          setMeta(found);
          if (found.accessType === "free") {
            await unlockCode();
          }
        } else {
          setNotFound(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch meta:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id, unlockCode]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    unlockCode(password);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCode = () => {
    if (!codeData) return;
    
    if (codeData.downloadUrl) {
      window.open(codeData.downloadUrl, "_blank");
    } else {
      const blob = new Blob([codeData.code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${codeData.title.toLowerCase().replace(/\s+/g, "-")}.${getFileExtension(codeData.language)}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getFileExtension = (language: string) => {
    const extensions: Record<string, string> = {
      "JavaScript": "js",
      "TypeScript": "ts",
      "Python": "py",
      "PHP": "php",
      "Java": "java",
      "C++": "cpp",
      "C#": "cs",
      "Go": "go",
      "Rust": "rs",
      "Ruby": "rb",
      "Swift": "swift",
      "Kotlin": "kt",
      "Dart": "dart",
      "HTML": "html",
      "CSS": "css",
      "SCSS": "scss",
      "SQL": "sql",
      "Shell": "sh",
      "Bash": "sh",
      "PowerShell": "ps1",
      "JSON": "json",
      "YAML": "yaml",
      "Markdown": "md",
    };
    return extensions[language] || "txt";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (notFound || !meta) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
        <Terminal className="w-16 h-16 mb-4 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Code Not Found</h1>
        <p className="text-muted-foreground mb-6">The code you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/library" className="text-violet-400 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link 
            href="/library" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Terminal className="w-7 h-7 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{meta.title}</h1>
                {meta.accessType === "password" ? (
                  <Lock className="w-5 h-5 text-amber-400" />
                ) : (
                  <Unlock className="w-5 h-5 text-emerald-400" />
                )}
              </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                    {meta.progLanguage}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {meta.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(meta.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors ml-auto"
                  >
                    {shareClicked ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    {shareClicked ? "Copied!" : "Share"}
                  </button>
                </div>
            </div>
          </div>

          <p className="text-muted-foreground mb-4">{meta.description}</p>

          {meta.hashtags && meta.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {meta.hashtags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-sm rounded-full bg-violet-500/10 text-violet-400">
                  <Hash className="w-3 h-3 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!codeData && meta.accessType === "password" ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117] shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="ml-3 text-xs text-gray-400 font-mono">authenticate — bash</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-400 font-mono">LOCKED</span>
                  </div>
                </div>
                
                <div className="p-6 font-mono text-sm">
                  <div className="text-gray-500 mb-4">
                    <span className="text-emerald-400">$</span> cat README.md
                  </div>
                  <div className="mb-6 pl-4 border-l-2 border-gray-700">
                    <p className="text-gray-400 mb-2">
                      <span className="text-amber-400">⚠</span> This code is password protected.
                    </p>
                    <p className="text-gray-500 text-xs">
                      Enter the correct password to decrypt and view the source code.
                    </p>
                  </div>
                  
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-emerald-400">$</span>
                      <span className="text-gray-400">sudo unlock</span>
                      <span className="text-cyan-400">--password</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-600 font-mono"
                        autoFocus
                      />
                      <span className="w-2 h-5 bg-emerald-400 animate-pulse" />
                    </div>
                    
                    {passwordError && (
                      <div className="mb-4 text-red-400 text-xs flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        Error: {passwordError}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                      <button
                        type="submit"
                        disabled={unlocking || !password}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs"
                      >
                        {unlocking ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            decrypting...
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            ./unlock.sh
                          </>
                        )}
                      </button>
                      <span className="text-gray-600 text-xs">Press Enter to execute</span>
                    </div>
                  </form>
                  
                  <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3 h-3" />
                      <span>Hint: Contact the author if you forgot the password</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : codeData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <TerminalWindow
                title={`${codeData.title.toLowerCase().replace(/\s+/g, "-")}.${getFileExtension(codeData.language)}`}
                language={codeData.language}
                onCopy={() => copyToClipboard(codeData.code, "main")}
                copied={copied === "main"}
              >
                <CodeBlock code={codeData.code} language={codeData.language} />
              </TerminalWindow>

              {codeData.exampleUsage && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-400" />
                    Example Usage
                  </h4>
                  <TerminalWindow
                    title="example"
                    onCopy={() => copyToClipboard(codeData.exampleUsage!, "example")}
                    copied={copied === "example"}
                  >
                    <CodeBlock code={codeData.exampleUsage} language={codeData.language} />
                  </TerminalWindow>
                </div>
              )}

              {codeData.output && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    Output
                  </h4>
                  <TerminalWindow title="output">
                    <pre className="p-4 text-sm font-mono text-emerald-400 whitespace-pre-wrap">
                      {codeData.output}
                    </pre>
                  </TerminalWindow>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => copyToClipboard(codeData.code, "main")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl text-foreground hover:bg-accent transition-colors"
                >
                  {copied === "main" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied === "main" ? "Copied!" : "Copy Code"}
                </button>
                <button
                  onClick={downloadCode}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  {codeData.downloadType === "zip" ? "Download ZIP" : "Download"}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
