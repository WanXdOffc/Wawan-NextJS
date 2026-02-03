"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Save,
  Check,
  Globe,
  Phone,
  MapPin,
  Image,
  FileText,
  Heart,
  Eye,
  EyeOff,
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  Link as LinkIcon,
  AlertTriangle,
  ShoppingCart,
  Mail,
  Power,
  Music,
  Code2,
  ImageIcon,
  Upload,
  Bot,
} from "lucide-react";

interface SocialMedia {
  platform: string;
  url: string;
  enabled: boolean;
}

interface SiteSettings {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  aboutText: string;
  interests: string;
  hobbies: string;
  profileImage: string;
  experience: string;
  status: string;
  education: string;
  socialMedia: SocialMedia[];
  footerSocialMedia: SocialMedia[];
  checkoutUrl: string;
  donationUrl: string;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface RateLimitSettings {
  rateLimit: number;
  windowHours: number;
  spamLimit: number;
  spamWindowSeconds: number;
}

interface TempMailSettings {
  limitPerIpPerDay: number;
  enabled: boolean;
}

interface ServiceStatus {
  musicPlayer: boolean;
  library: boolean;
  aiImage: boolean;
  tempMail: boolean;
  uploader: boolean;
  wanyzxAi: boolean;
  webParser: boolean;
}

const socialPlatforms = [
  { id: "github", label: "GitHub", icon: Github },
  { id: "twitter", label: "Twitter/X", icon: Twitter },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "facebook", label: "Facebook", icon: Facebook },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    displayName: "Wanyzx",
    email: "contact@wanyzx.com",
    phone: "+62 xxx xxxx xxxx",
    location: "Indonesia",
    bio: "Full Stack Developer passionate about creating beautiful web experiences.",
    aboutText: "I'm a passionate Full Stack Developer with a love for creating beautiful, functional, and user-friendly applications.",
    interests: "Coding, Design, Tech, Coffee, Music, Gaming",
    hobbies: "Programming, Reading, Photography",
    profileImage: "/avatar.png",
    experience: "3+ Years",
    status: "Open to Work",
    education: "Self-taught",
    socialMedia: socialPlatforms.map(p => ({ platform: p.id, url: "", enabled: false })),
    footerSocialMedia: socialPlatforms.map(p => ({ platform: p.id, url: "", enabled: false })),
    checkoutUrl: "",
    donationUrl: "",
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [rateLimitSettings, setRateLimitSettings] = useState<RateLimitSettings>({
    rateLimit: 100,
    windowHours: 1,
    spamLimit: 5,
    spamWindowSeconds: 5,
  });

  const [tempMailSettings, setTempMailSettings] = useState<TempMailSettings>({
    limitPerIpPerDay: 5,
    enabled: true,
  });

  const [services, setServices] = useState<ServiceStatus>({
    musicPlayer: true,
    library: true,
    aiImage: true,
    tempMail: true,
    uploader: true,
    wanyzxAi: true,
    webParser: true,
  });
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then(res => res.json()),
      fetch("/api/settings/rate-limit").then(res => res.json()),
      fetch("/api/admin/tempmail").then(res => res.json()),
      fetch("/api/admin/services").then(res => res.json()),
    ])
      .then(([settingsData, rateLimitData, tempMailData, servicesData]) => {
        if (settingsData.siteSettings) {
          setSiteSettings(prev => ({ ...prev, ...settingsData.siteSettings }));
        }
          if (rateLimitData) {
            setRateLimitSettings({
              rateLimit: rateLimitData.rateLimit || 100,
              windowHours: rateLimitData.windowHours || 1,
              spamLimit: rateLimitData.spamLimit || 5,
              spamWindowSeconds: rateLimitData.spamWindowSeconds || 5,
            });
          }

        if (tempMailData.settings) {
          setTempMailSettings(tempMailData.settings);
        }
        if (servicesData.success) {
          setServices(servicesData.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleService = async (key: keyof ServiceStatus) => {
    setToggling(key);
    try {
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !services[key] }),
      });
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      console.error("Failed to toggle service:", error);
    } finally {
      setToggling(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteSettings }),
        }),
        fetch("/api/settings/rate-limit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rateLimitSettings),
        }),
        fetch("/api/admin/tempmail", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tempMailSettings),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setPasswordError("Password baru tidak cocok!");
      return;
    }

    if (securitySettings.newPassword.length < 6) {
      setPasswordError("Password minimal 6 karakter!");
      return;
    }

    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: securitySettings.currentPassword,
          newPassword: securitySettings.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Gagal mengubah password!");
        return;
      }

      setPasswordSuccess("Password berhasil diubah!");
      setSecuritySettings({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setPasswordError("Gagal mengubah password!");
    }
  };

  const updateSocialMedia = (index: number, field: string, value: string | boolean, isFooter: boolean = false) => {
    const key = isFooter ? 'footerSocialMedia' : 'socialMedia';
    setSiteSettings(prev => ({
      ...prev,
      [key]: prev[key].map((sm, i) => 
        i === index ? { ...sm, [field]: value } : sm
      ),
    }));
  };

  const tabs = [
    { id: "profile", label: "Profil & Contact", icon: User },
    { id: "about", label: "About Page", icon: FileText },
    { id: "shop", label: "Shop Settings", icon: ShoppingCart },
    { id: "social", label: "Social Media", icon: Globe },
    { id: "services", label: "Services", icon: Power },
    { id: "ratelimit", label: "Rate Limit", icon: AlertTriangle },
    { id: "tempmail", label: "TempMail", icon: Mail },
    { id: "security", label: "Keamanan", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Kelola pengaturan website portfolio kamu</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-[#12121a] rounded-2xl border border-white/5 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#12121a] rounded-2xl border border-white/5 p-6"
          >
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Profil & Informasi Kontak
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nama Tampilan
                    </label>
                    <input
                      type="text"
                      value={siteSettings.displayName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, displayName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={siteSettings.email}
                        onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nomor HP
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={siteSettings.phone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                        placeholder="+62 812 xxxx xxxx"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Lokasi
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={siteSettings.location}
                        onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                        placeholder="Jakarta, Indonesia"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Bio Singkat (untuk Contact Page)
                  </label>
                  <textarea
                    value={siteSettings.bio}
                    onChange={(e) => setSiteSettings({ ...siteSettings, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Pengaturan About Page
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    URL Foto Profil
                  </label>
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={siteSettings.profileImage}
                      onChange={(e) => setSiteSettings({ ...siteSettings, profileImage: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                      placeholder="/avatar.png atau URL gambar"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Masukkan path lokal (/avatar.png) atau URL gambar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Tentang Saya (About Text)
                  </label>
                  <textarea
                    value={siteSettings.aboutText}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutText: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 resize-none"
                    placeholder="Ceritakan tentang diri kamu..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Pengalaman
                    </label>
                    <input
                      type="text"
                      value={siteSettings.experience}
                      onChange={(e) => setSiteSettings({ ...siteSettings, experience: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                      placeholder="3+ Years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Status
                    </label>
                    <input
                      type="text"
                      value={siteSettings.status}
                      onChange={(e) => setSiteSettings({ ...siteSettings, status: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                      placeholder="Open to Work"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Pendidikan
                    </label>
                    <input
                      type="text"
                      value={siteSettings.education}
                      onChange={(e) => setSiteSettings({ ...siteSettings, education: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                      placeholder="Self-taught"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <Heart className="w-4 h-4 inline mr-1" />
                    Interests (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.interests}
                    onChange={(e) => setSiteSettings({ ...siteSettings, interests: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                    placeholder="Coding, Design, Tech, Coffee, Music, Gaming"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Hobbies (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.hobbies}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hobbies: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                    placeholder="Programming, Reading, Photography"
                  />
                </div>
                </div>
              )}

              {activeTab === "shop" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">
                    Shop Settings
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Checkout URL
                    </label>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={siteSettings.checkoutUrl}
                        onChange={(e) => setSiteSettings({ ...siteSettings, checkoutUrl: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                        placeholder="https://wa.me/62xxx atau link checkout lainnya"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Link ini akan digunakan untuk tombol Checkout di halaman Shop. Bisa menggunakan link WhatsApp, form order, atau payment gateway.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <p className="text-violet-300 text-sm">
                      <strong>Contoh URL:</strong>
                    </p>
                    <ul className="text-gray-400 text-sm mt-2 space-y-1">
                      <li>• WhatsApp: <code className="text-white bg-white/10 px-1 rounded">https://wa.me/6281234567890</code></li>
                      <li>• Google Form: <code className="text-white bg-white/10 px-1 rounded">https://forms.gle/xxx</code></li>
                      <li>• Custom: <code className="text-white bg-white/10 px-1 rounded">https://yoursite.com/order</code></li>
                    </ul>
                  </div>
                  </div>
                )}

                  {activeTab === "social" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Social Media - Contact Page</h2>
                  <p className="text-gray-400 text-sm mb-6">Tampil di halaman Contact</p>

                  <div className="space-y-4">
                    {socialPlatforms.map((platform, index) => {
                      const social = siteSettings.socialMedia[index];
                      const Icon = platform.icon;
                      return (
                        <div key={platform.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                          <Icon className="w-6 h-6 text-gray-400" />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-white mb-1">{platform.label}</label>
                            <input
                              type="url"
                              value={social?.url || ""}
                              onChange={(e) => updateSocialMedia(index, "url", e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
                              placeholder={`https://${platform.id}.com/username`}
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={social?.enabled || false}
                              onChange={(e) => updateSocialMedia(index, "enabled", e.target.checked)}
                              className="w-4 h-4 rounded border-gray-600 bg-white/10 text-violet-500 focus:ring-violet-500"
                            />
                            <span className="text-sm text-gray-400">Aktif</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <h2 className="text-xl font-bold text-white mb-2">Social Media - Footer</h2>
                  <p className="text-gray-400 text-sm mb-6">Tampil di footer website</p>

                  <div className="space-y-4">
                    {socialPlatforms.map((platform, index) => {
                      const social = siteSettings.footerSocialMedia[index];
                      const Icon = platform.icon;
                      return (
                        <div key={`footer-${platform.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                          <Icon className="w-6 h-6 text-gray-400" />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-white mb-1">{platform.label}</label>
                            <input
                              type="url"
                              value={social?.url || ""}
                              onChange={(e) => updateSocialMedia(index, "url", e.target.value, true)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
                              placeholder={`https://${platform.id}.com/username`}
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={social?.enabled || false}
                              onChange={(e) => updateSocialMedia(index, "enabled", e.target.checked, true)}
                              className="w-4 h-4 rounded border-gray-600 bg-white/10 text-violet-500 focus:ring-violet-500"
                            />
                            <span className="text-sm text-gray-400">Aktif</span>
                          </label>
                        </div>
                      );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "services" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Service Control</h2>
                    <p className="text-gray-400 text-sm mb-6">Nyalakan atau matikan layanan yang tersedia di website</p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                    <p className="text-amber-400 text-sm">
                      <strong>Info:</strong> Jika service dimatikan, pengunjung akan melihat halaman &quot;Service Unavailable&quot; saat mengakses fitur tersebut.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: "musicPlayer" as keyof ServiceStatus, name: "Music Player", desc: "Pemutar musik di /music", icon: Music, color: "indigo" },
                      { key: "library" as keyof ServiceStatus, name: "Code Library", desc: "Library kode di /library", icon: Code2, color: "cyan" },
                        { key: "aiImage" as keyof ServiceStatus, name: "AI Image Generator", desc: "Generator gambar AI di /ai-image", icon: ImageIcon, color: "violet" },
                        { key: "tempMail" as keyof ServiceStatus, name: "Temp Mail", desc: "Email sementara di /tools/tempmail", icon: Mail, color: "emerald" },
                        { key: "uploader" as keyof ServiceStatus, name: "File Uploader", desc: "Upload file di /tools/uploader", icon: Upload, color: "pink" },
                        { key: "wanyzxAi" as keyof ServiceStatus, name: "Wanyzx AI", desc: "AI Chat Assistant di /features/wanyzx-ai", icon: Bot, color: "blue" },
                        { key: "webParser" as keyof ServiceStatus, name: "Web Parser", desc: "AI Web Scraper di /tools/web-parser", icon: Globe, color: "indigo" },
                      ].map((service) => (
                      <div
                        key={service.key}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          services[service.key]
                            ? "bg-gradient-to-r from-white/5 to-transparent border-white/10"
                            : "bg-red-500/5 border-red-500/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            services[service.key] 
                              ? `bg-${service.color}-500/20` 
                              : "bg-gray-500/20"
                          }`}>
                            <service.icon className={`w-5 h-5 ${
                              services[service.key] 
                                ? `text-${service.color}-400` 
                                : "text-gray-500"
                            }`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{service.name}</p>
                            <p className="text-gray-500 text-sm">{service.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${services[service.key] ? "text-emerald-400" : "text-red-400"}`}>
                            {services[service.key] ? "Active" : "Disabled"}
                          </span>
                          <button
                            onClick={() => toggleService(service.key)}
                            disabled={toggling === service.key}
                            className={`relative w-14 h-7 rounded-full transition-all ${
                              services[service.key] ? "bg-emerald-500" : "bg-gray-600"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${
                                services[service.key] ? "left-8" : "left-1"
                              } ${toggling === service.key ? "animate-pulse" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {activeTab === "ratelimit" && (
                  <>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">
                          API Rate Limit Settings
                        </h2>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                        <p className="text-amber-400 text-sm">
                          <strong>Info:</strong> Rate limit ini hanya berlaku untuk endpoint API publik yang ada di API Docs (AI, Anime, Download, Spotify, Tools).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Maksimal Request API per IP
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="10000"
                            value={rateLimitSettings.rateLimit}
                            onChange={(e) => setRateLimitSettings({ ...rateLimitSettings, rateLimit: parseInt(e.target.value) || 100 })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                          />
                          <p className="text-xs text-gray-500 mt-1">Default: 100 requests</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Window Waktu (Jam)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={rateLimitSettings.windowHours}
                            onChange={(e) => setRateLimitSettings({ ...rateLimitSettings, windowHours: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                          />
                          <p className="text-xs text-gray-500 mt-1">Default: 1 jam</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 mt-4">
                        <p className="text-gray-300">
                          Konfigurasi API Rate Limit: <strong className="text-white">{rateLimitSettings.rateLimit} requests</strong> per <strong className="text-white">{rateLimitSettings.windowHours} jam</strong> per IP address.
                        </p>
                      </div>

                        <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                          <p className="text-violet-300 text-sm font-medium mb-2">Endpoint yang terkena rate limit:</p>
                            <ul className="text-gray-400 text-sm space-y-1">
                              <li>• {'/api/ai/*'} (Claude, Gemini, Perplexity, Venice)</li>
                              <li>• {'/api/anime'}</li>
                              <li>• {'/api/dl/*'} (TikTok, dll)</li>
                              <li>• {'/api/spotify/*'}</li>
                              <li>• {'/api/tools/*'} (GPT Image, Short URL)</li>
                              <li>• {'/api-docs'} (Halaman dokumentasi API)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 mt-8">
                      <h2 className="text-xl font-bold text-white mb-4">
                        Anti-Spam (Short-term Rate Limit)
                      </h2>

                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                        <p className="text-blue-400 text-sm">
                          <strong>Info:</strong> Fitur ini membatasi request dalam rentang waktu yang sangat singkat untuk mencegah spamming (berkali-kali dalam beberapa detik).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Maksimal Request per Rentang Waktu
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={rateLimitSettings.spamLimit}
                            onChange={(e) => setRateLimitSettings({ ...rateLimitSettings, spamLimit: parseInt(e.target.value) || 5 })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                          />
                          <p className="text-xs text-gray-500 mt-1">Default: 5 requests</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Window Waktu (Detik)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={rateLimitSettings.spamWindowSeconds}
                            onChange={(e) => setRateLimitSettings({ ...rateLimitSettings, spamWindowSeconds: parseInt(e.target.value) || 5 })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                          />
                          <p className="text-xs text-gray-500 mt-1">Default: 5 detik</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 mt-4">
                        <p className="text-gray-300">
                          Konfigurasi Anti-Spam: <strong className="text-white">{rateLimitSettings.spamLimit} requests</strong> per <strong className="text-white">{rateLimitSettings.spamWindowSeconds} detik</strong> per IP address.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "tempmail" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    TempMail Settings
                  </h2>

                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
                    <p className="text-cyan-400 text-sm">
                      <strong>Info:</strong> TempMail memungkinkan pengunjung membuat email sementara. Atur limit per IP untuk mencegah abuse.
                    </p>
                  </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Limit Email per IP per Hari
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={tempMailSettings.limitPerIpPerDay}
                      onChange={(e) => setTempMailSettings({ ...tempMailSettings, limitPerIpPerDay: parseInt(e.target.value) || 5 })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default: 5 email per IP per hari</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-300">
                      Setiap IP dapat membuat maksimal <strong className="text-white">{tempMailSettings.limitPerIpPerDay} email</strong> per hari.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Ubah Password Admin
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                        placeholder="Masukkan password saat ini"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={securitySettings.newPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                        placeholder="Masukkan password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                      placeholder="Konfirmasi password baru"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-red-400 text-sm">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-green-400 text-sm">{passwordSuccess}</p>
                  )}

                  <button
                    onClick={handlePasswordChange}
                    className="px-6 py-3 bg-violet-500/20 text-violet-400 rounded-xl font-medium hover:bg-violet-500/30 transition-colors"
                  >
                    Ubah Password
                  </button>
                </div>
              </div>
            )}

            {activeTab !== "security" && (
              <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Tersimpan!
                    </>
                  ) : saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
