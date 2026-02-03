"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Key, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Search, 
  User, 
  Mail, 
  Clock,
  Loader2,
  ShieldCheck,
  Filter,
  Terminal,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import axios from "axios";

export default function AdminWanyzxAiPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/wanyzx-ai/history");
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/admin/wanyzx-ai/history/${id}`);
      setSessions(prev => prev.filter(s => s._id !== id));
      toast.success("Session deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.ipAddress?.includes(search) || 
    s.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            WANYZX AI <span className="text-primary">HISTORY MONITOR</span>
          </h1>
          <p className="text-muted-foreground font-medium">Monitor active neural sessions across the network.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by IP or Title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 bg-card border-2 rounded-xl font-medium"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <Card className="border-2 border-dashed p-12 text-center">
            <h3 className="text-xl font-black">No sessions found</h3>
          </Card>
        ) : (
          filteredSessions.map((s) => (
            <Card key={s._id} className="border-2 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight">{s.title || "Quantum Session"}</h3>
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {new Date(s.updatedAt).toLocaleString()} • IP: {s.ipAddress || "Unknown"}
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="icon" className="rounded-xl" onClick={() => deleteSession(s._id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
