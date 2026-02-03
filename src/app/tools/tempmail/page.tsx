"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  RefreshCw,
  Copy,
  Check,
  Inbox,
  Clock,
  User,
  FileText,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface Email {
  _id: string;
  id?: string;
  from: string;
  subject: string;
  body: string;
  text?: string;
  content?: string;
  date: string | number;
  created_at?: string | number;
  received_at?: string | number;
  html?: string;
  html_body?: string;
  text_body?: string;
}

interface TempMailData {
  email: string;
  token: string;
  expiresAt?: string;
}

interface StatusData {
  enabled: boolean;
  limit: number;
  used: number;
  remaining: number;
  hasActiveSession: boolean;
  session: {
    email: string;
    token: string;
    expiresAt: string;
  } | null;
}

export default function TempMailPage() {
  const [tempMail, setTempMail] = useState<TempMailData | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<StatusData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/tools/tempmail");
      const data = await res.json();
      if (data.success) {
        setStatus(data);
        
        if (data.hasActiveSession && data.session) {
          setTempMail({
            email: data.session.email,
            token: data.session.token,
            expiresAt: data.session.expiresAt,
          });
        }
      }
    } catch {
      console.error("Failed to fetch status");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const createEmail = async (forceNew = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/tools/tempmail", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceNew })
      });
      const data = await res.json();

        if (!data.success) {
          toast.error(data.error || "Failed to create email");
          if (data.used !== undefined && data.limit !== undefined) {
            setStatus(prev => prev ? { ...prev, used: data.used, limit: data.limit, remaining: data.remaining } : null);
          }
          return;
        }

        const result = data.result;
        const emailData = result.data || result;
        const newEmail = emailData.email || emailData.address || result.email;
        setTempMail({
          email: newEmail,
          token: emailData.email_token || emailData.token || result.token,
          expiresAt: data.expiresAt,
        });
        
        setStatus(prev => prev ? { 
          ...prev, 
          used: data.used ?? prev.used + (data.isExisting ? 0 : 1),
          remaining: data.remaining ?? prev.remaining - (data.isExisting ? 0 : 1)
        } : null);
        
        if (!data.isExisting || forceNew) {
          setEmails([]);
          setSelectedEmail(null);
        }
        toast.success(data.isExisting ? "Melanjutkan sesi email sebelumnya" : "Email sementara baru berhasil dibuat!");
      } catch (error: any) {
        toast.error("Gagal membuat email sementara");
      } finally {
      setLoading(false);
    }
  };

  const fetchInbox = useCallback(async () => {
    if (!tempMail?.token) return;

    setRefreshing(true);
    try {
      const res = await fetch(`/api/tools/tempmail/inbox/${encodeURIComponent(tempMail.token)}`);
      const data = await res.json();

      if (data.success && data.result) {
        const result = data.result;
        const messages = Array.isArray(result) 
          ? result 
          : result.data?.messages || result.messages || [];
        setEmails(messages);
      }
    } catch {
      console.error("Failed to fetch inbox");
    } finally {
      setRefreshing(false);
    }
  }, [tempMail?.token]);

  useEffect(() => {
    if (tempMail?.token) {
      fetchInbox();
      intervalRef.current = setInterval(fetchInbox, 10000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tempMail?.token, fetchInbox]);

  const copyEmail = () => {
    if (tempMail?.email) {
      navigator.clipboard.writeText(tempMail.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string | number | undefined) => {
    if (!dateStr) return "Just now";
    
    try {
      let date: Date;
      
      if (typeof dateStr === "number") {
        date = dateStr > 9999999999 ? new Date(dateStr) : new Date(dateStr * 1000);
      } else if (!isNaN(Number(dateStr))) {
        const timestamp = Number(dateStr);
        date = timestamp > 9999999999 ? new Date(timestamp) : new Date(timestamp * 1000);
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      
      return date.toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}j ${minutes}m tersisa`;
    }
    return `${minutes}m tersisa`;
  };

  const getEmailHtml = (email: Email) => {
    return email.html || email.html_body || "";
  };

  const getEmailText = (email: Email) => {
    return email.body || email.text || email.text_body || email.content || "";
  };

  const hasHtmlContent = (email: Email) => {
    const html = getEmailHtml(email);
    return html.length > 0;
  };

  useEffect(() => {
    if (selectedEmail && iframeRef.current) {
      const iframe = iframeRef.current;
      const html = getEmailHtml(selectedEmail);
      const text = getEmailText(selectedEmail);
      
      const content = html || `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: system-ui, sans-serif; margin: 0; padding: 16px;">${text}</pre>`;
      
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <base target="_blank">
          <style>
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              padding: 16px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #333;
              background: #fff;
            }
            img { max-width: 100%; height: auto; }
            a { color: #1a73e8; }
            table { max-width: 100% !important; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>${content}</body>
        </html>
      `;
      
      iframe.srcdoc = fullHtml;
    }
  }, [selectedEmail]);

  if (initialLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--theme-primary))]" />
      </div>
    );
  }

  if (status && !status.enabled) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Service Unavailable</h1>
          <p className="text-muted-foreground">TempMail service is currently disabled by administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] text-sm font-medium mb-4">
            <Mail className="w-4 h-4" />
            Temporary Email
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-3">
            Temp<span className="gradient-text">Mail</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Generate disposable email addresses instantly. Perfect for sign-ups.
          </p>
          {status && (
            <p className="text-muted-foreground/70 text-sm mt-2">
              Limit: <span className="text-[hsl(var(--theme-primary))] font-semibold">{status.used}/{status.limit}</span> email hari ini
            </p>
          )}
        </motion.div>

        {!tempMail ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center">
                <Mail className="w-10 h-10 text-[hsl(var(--theme-primary))]" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Generate New Email</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Click below to create a temporary email address
                </p>

                <button
                onClick={() => createEmail(false)}
                disabled={loading || (status !== null && status.remaining <= 0)}
                className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Generate Email
                  </>
                )}
              </button>

              {status && (
                <p className="text-muted-foreground/70 text-xs mt-4">
                  {status.used}/{status.limit} digunakan hari ini
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-2xl border border-border p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground text-sm">Email Anda</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => createEmail(true)}
                      disabled={loading || (status !== null && status.remaining <= 0)}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      title="Buat email baru"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div
                  onClick={copyEmail}
                  className="group cursor-pointer p-3 rounded-xl bg-gradient-to-r from-[hsl(var(--theme-primary)/0.1)] to-[hsl(var(--theme-accent)/0.1)] border border-[hsl(var(--theme-primary)/0.2)] hover:border-[hsl(var(--theme-primary)/0.4)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[hsl(var(--theme-primary))] font-mono text-xs break-all flex-1">{tempMail.email}</p>
                    <button className="p-1.5 rounded-lg bg-background/50 hover:bg-background transition-colors flex-shrink-0">
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground/70">
                    {status && `${status.used}/${status.limit} digunakan`}
                  </span>
                  {tempMail.expiresAt && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeRemaining(tempMail.expiresAt)}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-bold text-foreground text-sm">Inbox</h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-[hsl(var(--theme-primary)/0.1)] text-[hsl(var(--theme-primary))] text-xs">
                      {emails.length}
                    </span>
                  </div>
                  <button
                    onClick={fetchInbox}
                    disabled={refreshing}
                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                  {emails.length === 0 ? (
                    <div className="p-6 text-center">
                      <Inbox className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-muted-foreground text-sm">Belum ada email</p>
                      <p className="text-muted-foreground/70 text-xs mt-1">
                        Menunggu email masuk...
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {emails.map((email, index) => (
                        <motion.button
                          key={email._id || email.id || index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedEmail(email)}
                          className={`w-full p-3 text-left hover:bg-accent/50 transition-colors ${
                            (selectedEmail?._id || selectedEmail?.id) === (email._id || email.id) ? "bg-accent/50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center flex-shrink-0">
                              <span className="text-[hsl(var(--theme-primary))] text-xs font-bold">
                                {(email.from || "?")[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-medium truncate text-sm">
                                {email.from?.split("<")[0]?.trim() || email.from || "Unknown"}
                              </p>
                              <p className="text-muted-foreground text-xs truncate">
                                {email.subject || "(No Subject)"}
                              </p>
                              <p className="text-muted-foreground/70 text-xs mt-0.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(email.date || email.created_at || email.received_at)}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl border border-border h-full min-h-[500px] flex flex-col">
                {selectedEmail ? (
                  <>
                    <div className="p-4 border-b border-border bg-muted/30">
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          onClick={() => setSelectedEmail(null)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors lg:hidden"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold">
                                {(selectedEmail.from || "?")[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-semibold truncate">
                                {selectedEmail.from?.split("<")[0]?.trim() || selectedEmail.from || "Unknown"}
                              </p>
                              <p className="text-muted-foreground text-xs truncate">
                                {selectedEmail.from?.match(/<(.+)>/)?.[1] || selectedEmail.from}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedEmail(null)}
                          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors hidden lg:block"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-muted-foreground text-xs">Tanggal: {formatDate(selectedEmail.date || selectedEmail.created_at || selectedEmail.received_at)}</p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Pokok: <span className="text-foreground font-medium">{selectedEmail.subject || "(No Subject)"}</span>
                          </p>
                        </div>
                        {hasHtmlContent(selectedEmail) && (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs flex-shrink-0">
                            HTML
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 bg-[#f5f6f7]">
                      <iframe
                        ref={iframeRef}
                        className="w-full h-full min-h-[400px] border-0"
                        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        title="Email Content"
                      />
                    </div>

                    <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-sm">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                      <p className="text-muted-foreground text-xs">Sumber: TempMail API</p>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">Pilih email untuk dibaca</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
