"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ShoppingBag,
  Zap,
  Eye,
  Clock,
  Music,
  Code2,
  Upload,
  TrendingUp,
  FolderOpen,
  Bell,
  Settings,
  BarChart3,
  Activity,
  Users,
  Globe,
  Calendar,
  Plus,
  Edit,
  Trash2,
  LogIn,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Medal,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  blogs: { total: number; published: number };
  products: { total: number; featured: number };
  skills: { total: number };
  projects: { total: number };
  files: { total: number };
  music: { total: number };
  library: { total: number };
  notifications: { total: number; active: number };
}

interface LeaderboardItem {
  path: string;
  title: string;
  image?: string;
  views: number;
}

interface RecentItem {
  _id: string;
  title?: string;
  name?: string;
  action?: string;
  description?: string;
  type: string;
  createdAt: string;
}

interface AnalyticsData {
  summary: {
    apiRequests: number;
    pageViews: number;
    uniqueVisitors: number;
  };
  charts: {
    apiRequestsOverTime: { _id: string | number; count: number }[];
    pageViewsOverTime: { _id: string | number; count: number }[];
  };
  topEndpoints: { _id: string; count: number }[];
  topPages: { _id: string; count: number }[];
  period: string;
}

type TimePeriod = "24h" | "7d" | "30d" | "1y" | "last_month";

const timePeriods: { value: TimePeriod; label: string }[] = [
  { value: "24h", label: "24 Jam" },
  { value: "7d", label: "7 Hari" },
  { value: "30d", label: "30 Hari" },
  { value: "1y", label: "1 Tahun" },
  { value: "last_month", label: "Bulan Lalu" },
];

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    blogs: { total: 0, published: 0 },
    products: { total: 0, featured: 0 },
    skills: { total: 0 },
    projects: { total: 0 },
    files: { total: 0 },
    music: { total: 0 },
    library: { total: 0 },
    notifications: { total: 0, active: 0 },
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("7d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderboardType, setLeaderboardType] = useState("blog");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("7");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchAnalytics = useCallback(async (period: TimePeriod) => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async (type: string, period: string) => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/api/admin/leaderboard?type=${type}&period=${period}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod, fetchAnalytics]);

  useEffect(() => {
    fetchLeaderboard(leaderboardType, leaderboardPeriod);
  }, [leaderboardType, leaderboardPeriod, fetchLeaderboard]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.recent) {
        setRecentItems(data.recent);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "create": return Plus;
      case "update": return Edit;
      case "delete": return Trash2;
      case "login": return LogIn;
      case "upload": return Upload;
      default: return Clock;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blog": return FileText;
      case "product": return ShoppingBag;
      case "project": return FolderOpen;
      case "file": return Upload;
      case "skill": return Zap;
      case "music": return Music;
      case "library": return Code2;
      case "notification": return Bell;
      case "settings": return Settings;
      case "donation": return Heart;
      default: return FileText;
    }
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case "create": return "bg-emerald-500/10 text-emerald-400";
      case "update": return "bg-blue-500/10 text-blue-400";
      case "delete": return "bg-red-500/10 text-red-400";
      case "login": return "bg-violet-500/10 text-violet-400";
      case "upload": return "bg-pink-500/10 text-pink-400";
      default: return "bg-gray-500/10 text-gray-400";
    }
  };

  const formatChartData = (data: { _id: string | number; count: number }[]) => {
    return data.map((item) => {
      let label = String(item._id);
      if (selectedPeriod === '24h' && typeof item._id === 'number') {
        label = `${item._id}:00`;
      }
      return {
        name: label,
        value: item.count,
      };
    });
  };

  const contentStats = [
    { label: "Blogs", value: stats.blogs.total, icon: FileText, color: "#3b82f6", href: "/admin/blogs" },
    { label: "Products", value: stats.products.total, icon: ShoppingBag, color: "#8b5cf6", href: "/admin/products" },
    { label: "Projects", value: stats.projects.total, icon: FolderOpen, color: "#10b981", href: "/admin/projects" },
    { label: "Skills", value: stats.skills.total, icon: Zap, color: "#f59e0b", href: "/admin/skills" },
    { label: "Files", value: stats.files.total, icon: Upload, color: "#ec4899", href: "/admin/files" },
    { label: "Music", value: stats.music.total, icon: Music, color: "#6366f1", href: "/admin/music" },
    { label: "Library", value: stats.library.total, icon: Code2, color: "#06b6d4", href: "/admin/library" },
    { label: "Notifications", value: stats.notifications.total, icon: Bell, color: "#ef4444", href: "/admin/notifications" },
  ];

  const pieData = contentStats.map(stat => ({
    name: stat.label,
    value: stat.value,
    color: stat.color,
  })).filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-gray-400 text-xs">{label}</p>
          <p className="text-white font-semibold">{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here&apos;s your overview.</p>
        </div>
        <Link href="/admin/settings">
          <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>Live</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {analyticsLoading ? "..." : (analytics?.summary.apiRequests || 0).toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">API Requests</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Eye className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>Active</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {analyticsLoading ? "..." : (analytics?.summary.pageViews || 0).toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Page Views</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Users className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex items-center gap-1 text-violet-400 text-sm">
              <Users className="w-4 h-4" />
              <span>Unique</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {analyticsLoading ? "..." : (analytics?.summary.uniqueVisitors || 0).toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Unique Visitors</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-[#12121a] border border-white/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
              <p className="text-sm text-gray-400">Traffic & API statistics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-gray-400" />
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period.value
                    ? "bg-violet-500 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-[#0a0a12] border border-white/5">
            <h3 className="text-sm font-medium text-white mb-4">API Requests Over Time</h3>
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={formatChartData(analytics?.charts.apiRequestsOverTime || [])}>
                  <defs>
                    <linearGradient id="apiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff40"
                    tick={{ fill: '#ffffff60', fontSize: 10 }}
                    axisLine={{ stroke: '#ffffff10' }}
                  />
                  <YAxis 
                    stroke="#ffffff40"
                    tick={{ fill: '#ffffff60', fontSize: 10 }}
                    axisLine={{ stroke: '#ffffff10' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#apiGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#0a0a12] border border-white/5">
            <h3 className="text-sm font-medium text-white mb-4">Page Views Over Time</h3>
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={formatChartData(analytics?.charts.pageViewsOverTime || [])}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff40"
                    tick={{ fill: '#ffffff60', fontSize: 10 }}
                    axisLine={{ stroke: '#ffffff10' }}
                  />
                  <YAxis 
                    stroke="#ffffff40"
                    tick={{ fill: '#ffffff60', fontSize: 10 }}
                    axisLine={{ stroke: '#ffffff10' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#viewsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {analytics && (analytics.topEndpoints?.length > 0 || analytics.topPages?.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            {analytics.topEndpoints?.length > 0 && (
              <div className="p-4 rounded-xl bg-[#0a0a12] border border-white/5">
                <h3 className="text-sm font-medium text-white mb-4">Top API Endpoints</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.topEndpoints.slice(0, 5).map(e => ({ name: e._id.split('/').pop(), value: e.count, fullPath: e._id }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff40"
                      tick={{ fill: '#ffffff60', fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="#ffffff40"
                      tick={{ fill: '#ffffff60', fontSize: 10 }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as { fullPath: string; value: number };
                          return (
                            <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                              <p className="text-gray-400 text-xs truncate max-w-[200px]">{data.fullPath}</p>
                              <p className="text-white font-semibold">{data.value.toLocaleString()} requests</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {analytics.topPages?.length > 0 && (
              <div className="p-4 rounded-xl bg-[#0a0a12] border border-white/5">
                <h3 className="text-sm font-medium text-white mb-4">Top Pages</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.topPages.slice(0, 5).map(p => ({ name: p._id === '/' ? 'Home' : p._id.split('/').pop(), value: p.count, fullPath: p._id }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff40"
                      tick={{ fill: '#ffffff60', fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="#ffffff40"
                      tick={{ fill: '#ffffff60', fontSize: 10 }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as { fullPath: string; value: number };
                          return (
                            <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                              <p className="text-gray-400 text-xs">{data.fullPath}</p>
                              <p className="text-white font-semibold">{data.value.toLocaleString()} views</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-[#12121a] border border-white/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              <p className="text-sm text-gray-400">Top performing content</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
              <select
                value={leaderboardType}
                onChange={(e) => setLeaderboardType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="blog" className="bg-[#12121a]">Blogs</option>
                <option value="file" className="bg-[#12121a]">Files</option>
                <option value="project" className="bg-[#12121a]">Projects</option>
                <option value="product" className="bg-[#12121a]">Products</option>
                  <option value="music" className="bg-[#12121a]">Music</option>
                  <option value="library" className="bg-[#12121a]">Code Library</option>
                  <option value="skill" className="bg-[#12121a]">Skills</option>
                  <option value="notification" className="bg-[#12121a]">Notifications</option>
                  <option value="request" className="bg-[#12121a]">Requests</option>
                  <option value="donation" className="bg-[#12121a]">Donations</option>
                  <option value="tool" className="bg-[#12121a]">Tools</option>
                </select>
            <select
              value={leaderboardPeriod}
              onChange={(e) => setLeaderboardPeriod(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="7" className="bg-[#12121a]">Last 7 Days</option>
              <option value="30" className="bg-[#12121a]">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboardLoading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              No data available for this period
            </div>
          ) : (
            leaderboard.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#0a0a12] border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center font-bold text-lg">
                  {index === 0 ? (
                    <Medal className="w-8 h-8 text-amber-400" />
                  ) : index === 1 ? (
                    <Medal className="w-8 h-8 text-gray-400" />
                  ) : index === 2 ? (
                    <Medal className="w-8 h-8 text-amber-700" />
                  ) : (
                    <span className="text-gray-600">#{index + 1}</span>
                  )}
                </div>

                {item.image ? (
                  <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-white/5" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs truncate">{item.path}</p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-white leading-none">{item.views}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Views</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[#12121a] border border-white/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <BarChart3 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Content Overview</h2>
              <p className="text-xs text-gray-500">All content statistics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {contentStats.map((item, index) => (
              <Link key={item.label} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="group p-4 rounded-xl bg-[#0a0a12] border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="text-xs text-gray-400">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{loading ? "..." : item.value}</p>
                </motion.div>
              </Link>
            ))}
          </div>

          {pieData.length > 0 && (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                            <p className="text-white font-semibold">{data.name}</p>
                            <p className="text-gray-400 text-sm">{data.value} items</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-[#12121a] border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {loading ? (
              <div className="text-gray-500 text-center py-8 text-sm">Loading...</div>
            ) : recentItems.length === 0 ? (
              <div className="text-gray-500 text-center py-8 text-sm">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No recent activity
              </div>
            ) : (
              recentItems.map((item, index) => {
                const TypeIcon = getTypeIcon(item.type);
                const ActionIcon = getActionIcon(item.action);
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getActionColor(item.action)}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-3 h-3 text-gray-500" />
                        <p className="text-white text-sm font-medium truncate">
                          {item.title || item.name || item.description}
                        </p>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {item.action && <span className="capitalize">{item.action}</span>}
                        {item.action && " · "}
                        {new Date(item.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-[#12121a] border border-white/5"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/admin/blogs?action=new">
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors group">
              <FileText className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium text-sm">New Blog</p>
            </div>
          </Link>
          <Link href="/admin/products?action=new">
            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-colors group">
              <ShoppingBag className="w-6 h-6 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium text-sm">New Product</p>
            </div>
          </Link>
          <Link href="/admin/music?action=new">
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors group">
              <Music className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium text-sm">Add Music</p>
            </div>
          </Link>
          <Link href="/" target="_blank">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group">
              <Eye className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium text-sm">View Site</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
