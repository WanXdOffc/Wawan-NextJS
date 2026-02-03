"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  History, 
  Plus, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
    Eye, 
    HelpCircle,
    X,
    ChevronLeft,
  Loader2,
  MoreVertical,
  Download,
  Copy,
  Check,
  Paperclip,
  Zap,
  Home,
  ShieldCheck,
  Cpu,
  Layers,
    Wand2,
    Terminal,
    AlertCircle,
    Search
  } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  type?: string;
  model?: string;
  createdAt?: string;
}

interface Session {
  sessionId: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

export default function WanyzxAiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [stagedFile, setStagedFile] = useState<{ base64: string; type: string; name: string } | null>(null);
  const [serviceEnabled, setServiceEnabled] = useState(true);
  
    // Settings
    const [settings, setSettings] = useState({
      model: "Mode Auto",
      verbosity: "balanced",
      language: "id",
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      webSearch: true
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      // Load settings from localStorage
      const savedSettings = localStorage.getItem("wanyzx_ai_settings");
      if (savedSettings) {
        try {
          setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
        } catch (e) {
          console.error("Failed to parse settings", e);
        }
      }
    }, []);

    useEffect(() => {
      // Save settings to localStorage
      localStorage.setItem("wanyzx_ai_settings", JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
      const checkServiceStatus = async () => {
        try {
            const res = await fetch("/api/services");
            const data = await res.json();
            if (data.success && data.services.wanyzxAi === false) {
              setServiceEnabled(false);
            }
        } catch (error) {
          console.error("Service check error:", error);
        }
      };
      checkServiceStatus();

      const handleResize = () => {
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      fetchSessions();
    }, []);

    useEffect(() => {
      if (activeSession) {
        fetchMessages(activeSession);
      } else {
        setMessages([]);
      }
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }, [activeSession]);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, loading]);

    const fetchSessions = async () => {
      try {
        const { data } = await axios.get("/api/ai/wanyzx/history");
        setSessions(data);
      } catch (error) {
        toast.error("Failed to load chat history");
      }
    };

    const fetchMessages = async (sessionId: string) => {
      try {
        const { data } = await axios.get(`/api/ai/wanyzx/history?sessionId=${sessionId}`);
        setMessages(data);
      } catch (error) {
        toast.error("Failed to load messages");
      }
    };

    const handleSend = async () => {
      if (!input.trim() && !stagedFile) return;

      const userMsg: Message = { 
        role: 'user', 
        content: stagedFile 
          ? (input ? `[Uploaded ${stagedFile.name}]\n\n${input}` : `[Uploaded ${stagedFile.name}]`)
          : input, 
        type: stagedFile ? (stagedFile.type.startsWith("image/") ? "vision" : "file") : "text" 
      };
      
      setMessages(prev => [...prev, userMsg]);
      const currentInput = input;
      const currentFile = stagedFile;
      
      setInput("");
      setStagedFile(null);
      setLoading(true);

      try {
        const { data } = await axios.post("/api/ai/wanyzx/chat", {
          message: currentInput,
          sessionId: activeSession,
          model: settings.model,
          type: userMsg.type,
          media: currentFile?.base64,
          settings: {
            language: settings.language,
            verbosity: settings.verbosity,
            temperature: settings.temperature,
            topP: settings.topP,
            maxTokens: settings.maxTokens,
            webSearch: settings.webSearch
          }
        });

        if (data.success) {
          if (!activeSession) {
            setActiveSession(data.sessionId);
            fetchSessions();
          }
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.reply, 
            type: data.type, 
            model: data.model || settings.model 
          }]);
        } else {
          toast.error(data.error || "Something went wrong");
          setMessages(prev => prev.slice(0, -1));
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || "Connection failed";
        toast.error(errorMsg);
        setMessages(prev => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size must be under 5MB");
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setStagedFile({
        base64,
        type: file.type,
        name: file.name
      });
      toast.success(`File "${file.name}" staged. You can now add instructions and send.`);
    };
    reader.readAsDataURL(file);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await axios.delete(`/api/ai/wanyzx/history?sessionId=${sessionId}`);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      if (activeSession === sessionId) setActiveSession(null);
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  const saveSettings = () => {
    setShowSettings(false);
    toast.success("Settings saved successfully");
  };

    if (!serviceEnabled) {
      return (
        <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-900/5 rounded-full blur-[120px]" />
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
            
            <p className="text-slate-400 max-w-md font-medium mb-12 text-sm md:text-base leading-relaxed">
              The Wanyzx AI tool has been temporarily disabled by the administrator. <br className="hidden md:block" /> 
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
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden relative selection:bg-primary/30 font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:relative w-[300px] h-full bg-slate-900/50 backdrop-blur-3xl border-r border-slate-800/50 flex flex-col z-[70] shadow-2xl lg:shadow-none"
          >
            <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">WANYZX AI</h1>
                  <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">Quantum Engine</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-slate-800/50 rounded-xl" onClick={() => setSidebarOpen(false)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4">
              <Button 
                onClick={() => setActiveSession(null)}
                className="w-full justify-start gap-3 rounded-[1.25rem] h-14 font-black transition-all hover:shadow-lg hover:shadow-primary/20 group relative overflow-hidden bg-primary text-white border-none"
              >
                <Plus className="w-5 h-5" /> 
                <span>NEW CHAT</span>
              </Button>
            </div>

            <ScrollArea className="flex-1 px-3">
              <div className="space-y-2 p-2 pb-10">
                <p className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal Logs</p>
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent ${
                      activeSession === session.sessionId 
                        ? "bg-slate-800 border-slate-700 text-white shadow-xl scale-[1.02]" 
                        : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                    }`}
                    onClick={() => setActiveSession(session.sessionId)}
                  >
                    <Terminal className={`w-4 h-4 shrink-0 ${activeSession === session.sessionId ? "text-primary" : "opacity-40"}`} />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-black truncate tracking-tight uppercase">{session.title || "Quantum Vector"}</p>
                      <p className="text-[10px] opacity-40 truncate font-medium mt-0.5 italic">{session.lastMessage}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.sessionId);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

              <div className="p-6 border-t border-slate-800/50 space-y-3 bg-slate-900/30">
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/" className="block">
                    <Button variant="ghost" className="w-full h-11 justify-start gap-2 rounded-xl text-[11px] font-black border border-transparent hover:border-slate-700 hover:bg-slate-800/50">
                      <Home className="w-4 h-4 text-emerald-500" /> HOME
                    </Button>
                  </Link>
                </div>
                <Button variant="ghost" className="w-full h-11 justify-start gap-3 rounded-xl text-[11px] font-black border border-transparent hover:border-slate-700 hover:bg-slate-800/50" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4 text-purple-500" /> SETTINGS
                </Button>
              </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#020617]/50 backdrop-blur-xl">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-6 md:px-10 bg-[#020617]/80 backdrop-blur-3xl z-50">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)} 
              className={`hover:bg-slate-800/50 rounded-xl transition-all ${sidebarOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}`}
            >
              <History className="w-5 h-5 text-primary" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h2 className="font-black text-sm md:text-base tracking-tighter uppercase truncate max-w-[150px] md:max-w-none text-white">
                  {activeSession ? sessions.find(s => s.sessionId === activeSession)?.title : "NEURAL INTERFACE"}
                </h2>
                <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase opacity-50">
                  MODEL: {settings.model} • STABLE
                </div>
              </div>
            </div>
          </div>
          
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black tracking-widest text-primary">
                <Zap className="w-3.5 h-3.5 fill-primary" />
                TURBO V2.0
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 rounded-2xl p-2 shadow-2xl">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-2">System Commands</DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs cursor-pointer focus:bg-slate-800" onClick={() => setShowSettings(true)}>
                    <Settings className="w-4 h-4 text-purple-500" /> Advanced Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs cursor-pointer focus:bg-slate-800" onClick={() => setActiveSession(null)}>
                    <Plus className="w-4 h-4 text-primary" /> New Session
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs cursor-pointer focus:bg-slate-800 text-red-500 focus:text-red-400" onClick={() => activeSession && deleteSession(activeSession)}>
                    <Trash2 className="w-4 h-4" /> Purge Current History
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 custom-scrollbar pb-32">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto py-20">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
                  <Wand2 className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              
              <div className="space-y-4 px-6">
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]"
                >
                  Neural <br />
                  <span className="text-primary">Synthesis.</span>
                </motion.h3>
                <p className="text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-widest text-xs">
                  Your platform-aware AI assistant. Enhanced with real-time data from Wanyzx's portfolio.
                </p>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
              >
                {[
                  "Show me Wanyzx's top projects",
                  "What skills does Wanyzx have?",
                  "Tell me about the latest blog posts",
                  "How can I hire Wanyzx?"
                ].map((t, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    className="rounded-2xl h-14 px-5 justify-start gap-3 font-bold border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-primary/50 transition-all text-xs uppercase tracking-tight text-slate-300"
                    onClick={() => setInput(t)}
                  >
                    <Terminal className="w-4 h-4 text-primary" />
                    {t}
                  </Button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={i}
                  className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-800 border border-slate-700'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />}
                  </div>
                    <div className={`flex flex-col max-w-[85%] md:max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4 md:p-5 rounded-[1.5rem] shadow-xl backdrop-blur-xl border transition-all ${
                        msg.role === 'user' 
                          ? 'bg-primary/90 text-white rounded-tr-none border-primary/20' 
                          : 'bg-slate-900/90 border-slate-800/50 rounded-tl-none'
                      }`}>
                      {msg.type === 'image' ? (
                        <div className="space-y-4">
                          <img src={msg.content} alt="Generated" className="rounded-xl max-w-full h-auto border border-slate-800" />
                          <Button size="sm" variant="secondary" className="w-full h-10 rounded-xl font-black bg-slate-800 hover:bg-slate-700 text-white border-none" onClick={() => window.open(msg.content)}>
                            <Download className="w-4 h-4 mr-2" /> SAVE NEURAL IMAGE
                          </Button>
                        </div>
                      ) : (
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-medium text-slate-100 leading-relaxed break-words">
                          <ReactMarkdown
                            components={{
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <div className="max-w-full overflow-x-auto my-4 rounded-xl border border-slate-800">
                                    <SyntaxHighlighter
                                      style={atomDark}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={{ background: '#0f172a', padding: '1rem', margin: 0 }}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className={`${className} bg-slate-800 px-1.5 py-0.5 rounded-md text-primary font-mono text-[0.85em]`} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {msg.role} • {msg.model || "CORE"}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          toast.success("DATA COPIED TO BUFFER");
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-3 h-3 text-slate-500 hover:text-primary" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto flex gap-3 md:gap-4"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="bg-slate-900/80 border border-slate-800/50 p-5 rounded-[1.5rem] rounded-tl-none shadow-xl flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-glow" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s] shadow-glow" />
                <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce [animation-delay:0.4s] shadow-glow" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-[auto] lg:w-[calc(100%-300px)] p-4 md:p-8 bg-[#020617]/80 backdrop-blur-3xl border-t border-slate-800/50 z-50">
          <div className="max-w-4xl mx-auto relative">
            {/* Staged File Preview */}
            <AnimatePresence>
              {stagedFile && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-full left-0 right-0 mb-4 p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 shadow-2xl"
                >
                  {stagedFile.type.startsWith("image/") ? (
                    <img src={stagedFile.base64} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate uppercase tracking-tighter">{stagedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">READY FOR TRANSMISSION</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/10 hover:text-red-500" onClick={() => setStagedFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

              <div className="relative flex items-center gap-2 md:gap-3 bg-slate-900/50 p-2 rounded-[2rem] border border-slate-800/50 focus-within:border-primary/50 transition-all shadow-2xl">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*,.pdf,.txt,.docx,.csv"
                />
                
                <Select value={settings.model} onValueChange={(v) => setSettings(p => ({...p, model: v}))}>
                  <SelectTrigger className="w-auto h-12 bg-transparent border-none focus:ring-0 gap-2 rounded-full px-4 hover:bg-slate-800 transition-all">
                    <Cpu className="w-5 h-5 text-primary" />
                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest truncate max-w-[80px]">
                      {settings.model.split(' ')[0]}
                    </span>
                  </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      <SelectItem value="Mode Auto">Mode Auto</SelectItem>
                      <SelectItem value="Gemini Scraper">Gemini Scraper</SelectItem>
                      <SelectItem value="Gemmy">Gemmy Neural</SelectItem>
                      <SelectItem value="Claude">Claude 3.5</SelectItem>
                      <SelectItem value="GPT">GPT-4o Engine</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-px h-8 bg-slate-800" />

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-12 w-12 shrink-0 hover:bg-slate-800 hover:text-primary transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Neural command..."
                  className="bg-transparent border-none focus-visible:ring-0 text-white font-bold placeholder:text-slate-600 px-2 h-12"
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={loading || (!input.trim() && !stagedFile)}
                  className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 transition-all shrink-0 shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
          </div>
        </div>
      </main>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-slate-950 border-slate-800 p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 border-b border-slate-800 relative">
            <div className="absolute top-0 right-0 p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase text-white tracking-tighter flex items-center gap-3">
                Neural <span className="text-primary">Core</span>
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">
                Advanced Quantum Configuration • V2.0.4
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Model & Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Bot className="w-3 h-3" /> Base Model
                </label>
                  <Select value={settings.model} onValueChange={(v) => setSettings(p => ({...p, model: v}))}>
                    <SelectTrigger className="h-14 bg-slate-900 border-slate-800 rounded-2xl font-bold hover:border-primary/50 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      <SelectItem value="Mode Auto">Mode Auto (Neural Engine)</SelectItem>
                      <SelectItem value="Gemini Scraper">Gemini Scraper (Open)</SelectItem>
                      <SelectItem value="Gemmy">Gemmy Neural (Advanced)</SelectItem>
                      <SelectItem value="Claude">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="GPT">GPT-4o Engine</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Language Sync
                </label>
                <Select value={settings.language} onValueChange={(v) => setSettings(p => ({...p, language: v}))}>
                  <SelectTrigger className="h-14 bg-slate-900 border-slate-800 rounded-2xl font-bold hover:border-primary/50 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                    <SelectItem value="id">Indonesian (Bahasa)</SelectItem>
                    <SelectItem value="en">English (Neural Default)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-px bg-slate-800/50" />

            {/* Advanced Parameters */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-tight text-white">Temperature</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Randomness vs Determinism</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-primary font-mono">
                  {settings.temperature.toFixed(1)}
                </span>
              </div>
              <Slider 
                value={[settings.temperature]} 
                min={0} max={1} step={0.1} 
                onValueChange={([v]) => setSettings(p => ({...p, temperature: v}))}
                className="py-4"
              />

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-tight text-white">Top P</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nucleus Sampling</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-primary font-mono">
                  {settings.topP.toFixed(2)}
                </span>
              </div>
              <Slider 
                value={[settings.topP]} 
                min={0} max={1} step={0.01} 
                onValueChange={([v]) => setSettings(p => ({...p, topP: v}))}
                className="py-4"
              />

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-tight text-white">Max Tokens</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Response Length Limit</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-primary font-mono">
                  {settings.maxTokens}
                </span>
              </div>
              <Slider 
                value={[settings.maxTokens]} 
                min={256} max={4096} step={128} 
                onValueChange={([v]) => setSettings(p => ({...p, maxTokens: v}))}
                className="py-4"
              />
            </div>

            <div className="h-px bg-slate-800/50" />

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Search className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-white">Neural Search</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Enhanced Web Intelligence</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.webSearch} 
                  onCheckedChange={(v) => setSettings(p => ({...p, webSearch: v}))}
                />
              </div>
            </div>
          </div>

          <div className="p-8 pt-0">
            <Button 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-xs" 
              onClick={saveSettings}
            >
              SYNCHRONIZE CORE
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Space Grotesk', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary), 0.2);
        }

        .shadow-glow {
          box-shadow: 0 0 10px rgba(var(--primary), 0.5);
        }
      `}</style>
    </div>
  );
}
