"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code2, 
  Globe, 
  Cpu, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Loader2, 
  ChevronRight,
  Sparkles,
  Terminal,
  RefreshCw,
  Braces,
  Search,
  Zap,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function WebParserPage() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [model, setModel] = useState("auto");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"code" | "data">("code");
  const [step, setStep] = useState(0);
  const [serviceEnabled, setServiceEnabled] = useState(true);

  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        const res = await fetch("/api/tools/web-parser");
        const data = await res.json();
        if (data.success && data.enabled === false) {
          setServiceEnabled(false);
        }
      } catch (error) {
        console.error("Service check error:", error);
      }
    };
    checkServiceStatus();
  }, []);

  const handleParse = async () => {
    if (!url) {
      toast.error("Silakan masukkan URL website");
      return;
    }

    setLoading(true);
    setResult(null);
    setStep(1);

    const steps = [
      "Fetching target website...",
      "Analyzing structure...",
      "Generating scraper logic...",
      "Running auto-test sandbox..."
    ];

    const stepInterval = setInterval(() => {
      setStep(s => (s < 4 ? s + 1 : s));
    }, 3000);

    try {
      const response = await fetch("/api/tools/web-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language, model, instructions }),
      });

      const data = await response.json();

        if (data.status) {
          setResult(data);
          toast.success("Web parser berhasil dibuat dan LULUS auto testing!");
        } else {
          toast.error(data.error || "Gagal menghasilkan parser");
          setResult(data);
        }
      } catch (error: any) {
        toast.error("Terjadi kesalahan sistem");
        console.error(error);
      } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setStep(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Berhasil disalin ke clipboard");
  };

  if (!serviceEnabled) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse" />
            <div className="relative w-28 h-28 rounded-[2rem] bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <AlertCircle className="w-14 h-14 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-6 leading-none">
            Service <span className="text-red-500">Offline</span>
          </h1>
          
          <p className="text-zinc-400 max-w-md font-medium mb-12 text-sm md:text-base leading-relaxed">
            The Web Parser tool has been temporarily disabled by the administrator. <br className="hidden md:block" /> 
            Please check back later.
          </p>

          <Link href="/">
            <Button className="rounded-full h-14 px-12 font-black bg-white text-black hover:bg-white/90 transition-all text-xs tracking-[0.2em]">
              RETURN TO HOME
            </Button>
          </Link>
        </div>

        {/* Bottom Logo Decor */}
        <div className="absolute bottom-10 left-10 opacity-20">
          <div className="w-10 h-10 rounded-xl border border-white flex items-center justify-center font-black text-white">W</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(var(--primary),0.1)]"
          >
            <Zap className="w-3 h-3 fill-current" />
            Advanced AI Scraper V2
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-none"
          >
            WEB <span className="gradient-text">PARSER</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Hasilkan kode scraper cerdas yang valid, bisa dijalankan, dan LULUS auto-testing di server sandbox sebelum ditampilkan.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            <Card className="border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  Konfigurasi Scraper
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 relative">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Search className="w-3 h-3" /> Target URL
                  </label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="https://example.com/product/123" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-14 pl-12 bg-background/50 border-2 focus:border-primary/50 transition-all rounded-2xl font-medium"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors">
                      <Globe className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Language</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-12 bg-background/50 border-2 rounded-xl font-bold">
                        <SelectValue placeholder="Pilih Bahasa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript (Node.js)</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">AI Model</label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="h-12 bg-background/50 border-2 rounded-xl font-bold">
                        <SelectValue placeholder="Pilih Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto Adaptive</SelectItem>
                        <SelectItem value="gpt3">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude">Claude 3 Haiku</SelectItem>
                        <SelectItem value="gemini">Gemini 1.5 Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Braces className="w-3 h-3" /> Extraction Instructions
                  </label>
                  <Textarea 
                    placeholder="Ambil judul produk, harga, diskon, dan rating. Simpan dalam format JSON yang rapi." 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="min-h-[140px] bg-background/50 border-2 focus:border-primary/50 transition-all rounded-2xl p-4 font-medium resize-none leading-relaxed"
                  />
                </div>

                <Button 
                  onClick={handleParse} 
                  disabled={loading}
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group/btn overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      PARSING DATA...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Cpu className="w-6 h-6" />
                      GENERATE & AUTO-TEST
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Metadata Preview */}
            <AnimatePresence>
              {result?.metadata && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm overflow-hidden shadow-lg border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Website Metadata Verified
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Page Title</span>
                        <p className="text-sm font-bold leading-tight">{result.metadata.title}</p>
                      </div>
                      <div className="flex justify-between items-center bg-background/40 p-3 rounded-xl border border-border/50">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Domain</span>
                          <p className="text-xs font-mono font-bold text-primary">{result.metadata.domain}</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black">ACTIVE</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Result Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <Card className="h-full border-border/50 bg-card/40 backdrop-blur-xl flex flex-col min-h-[650px] overflow-hidden shadow-2xl rounded-[2.5rem]">
              {!result && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse" />
                    <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-border/50 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-500">
                      <Terminal className="w-14 h-14 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-3 max-w-sm">
                    <h3 className="text-2xl font-black tracking-tight">Menunggu Input...</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                      AI akan menghasilkan kode scraper yang diuji secara otomatis. Hasil data ekstraksi akan ditampilkan jika kode berhasil dijalankan tanpa error.
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-10">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                        <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-4 w-full max-w-xs">
                    <h3 className="text-2xl font-black tracking-tight animate-pulse">Processing...</h3>
                    <div className="space-y-3">
                      {[
                        "Fetching target website...",
                        "Analyzing structure...",
                        "Generating scraper logic...",
                        "Running auto-test sandbox..."
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-mono transition-all duration-500" style={{ opacity: step > i ? 1 : 0.3 }}>
                          {step > i ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted" />
                          )}
                          <span className={step === i + 1 ? "text-primary font-bold" : "text-muted-foreground"}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-8 py-6 border-b border-border/50 bg-muted/20 backdrop-blur-sm">
                    <div className="flex p-1 bg-background/50 rounded-2xl border-2 border-border/50">
                      <button 
                        onClick={() => setActiveTab("code")}
                        className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === "code" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Code
                      </button>
                      <button 
                        onClick={() => setActiveTab("data")}
                        className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === "data" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Result
                      </button>
                    </div>
                    {result.status && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 px-4 rounded-xl border-2 gap-2 font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => copyToClipboard(activeTab === "code" ? result.code : JSON.stringify(result.extracted_data || result.data, null, 2))}
                      >
                        <Copy className="w-4 h-4" />
                        Copy {activeTab === "code" ? "Code" : "JSON"}
                      </Button>
                    )}
                  </div>

                    <div className="flex-1 overflow-auto bg-[#0a0a0a] p-0 relative custom-scrollbar">
                      {activeTab === "code" ? (
                        result.status ? (
                          <SyntaxHighlighter 
                            language={language} 
                            style={atomDark}
                            customStyle={{
                              margin: 0,
                              padding: '2rem',
                              background: 'transparent',
                              fontSize: '0.875rem',
                              lineHeight: '1.5',
                            }}
                          >
                            {result.code}
                          </SyntaxHighlighter>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center rotate-12 border-2 border-destructive/20 shadow-2xl shadow-destructive/10">
                              <AlertCircle className="w-12 h-12 text-destructive" />
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-3xl font-black text-destructive tracking-tighter uppercase">Auto Test Failed</h3>
                              <p className="text-muted-foreground font-medium text-sm max-w-sm mx-auto leading-relaxed">
                                {result.error || "AI gagal membuat kode yang valid untuk website ini. Silakan periksa URL atau instruksi Anda."}
                              </p>
                              {result.details && (
                                <div className="mt-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-[10px] font-mono text-destructive/60 text-left max-w-md mx-auto overflow-auto max-h-32">
                                  {result.details}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      ) : (
                        <SyntaxHighlighter 
                          language="json" 
                          style={atomDark}
                          customStyle={{
                            margin: 0,
                            padding: '2rem',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                          }}
                        >
                          {JSON.stringify(result.extracted_data || result.data, null, 2)}
                        </SyntaxHighlighter>
                      )}
                    </div>

                  {result.status && (
                    <div className="p-6 border-t border-border/50 bg-emerald-500/5 backdrop-blur-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Auto-Test Success</p>
                          <p className="text-[10px] text-muted-foreground font-bold font-mono">CODE VALIDATED & EXECUTED</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Model Confidence</p>
                          <p className="text-xs font-bold font-mono text-primary">{(result.confidence * 100 || 95).toFixed(1)}%</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black px-3 py-1 text-[10px]">{result.language.toUpperCase()}</Badge>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--theme-accent, 262 83% 58%)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
