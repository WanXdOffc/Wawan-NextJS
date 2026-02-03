"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Twitter, Instagram, Linkedin, Youtube, Facebook } from "lucide-react";

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
  socialMedia: SocialMedia[];
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  facebook: Facebook,
};

const socialColors: Record<string, string> = {
  github: "hover:bg-gray-800",
  twitter: "hover:bg-blue-500",
  instagram: "hover:bg-pink-600",
  linkedin: "hover:bg-blue-700",
  youtube: "hover:bg-red-600",
  facebook: "hover:bg-blue-600",
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    displayName: "Wanyzx",
    email: "contact@wanyzx.com",
    phone: "+62 xxx xxxx xxxx",
    location: "Indonesia",
    bio: "",
    socialMedia: [],
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.siteSettings) {
          setSettings(prev => ({ ...prev, ...data.siteSettings }));
        }
      })
      .catch(() => {});
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: settings.location,
      href: "#",
    },
    {
      icon: Phone,
      label: "Phone",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s/g, "")}`,
    },
  ];

  const activeSocials = settings.socialMedia?.filter(s => s.enabled && s.url) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setSuccess(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
    
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a question or want to work together? Feel free to reach out!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.5)] transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {activeSocials.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Follow Me</h2>
                <div className="flex gap-3">
                  {activeSocials.map((social) => {
                    const Icon = socialIcons[social.platform];
                    const colorClass = socialColors[social.platform] || "hover:bg-gray-700";
                    if (!Icon) return null;
                    return (
                      <button
                        key={social.platform}
                        onClick={() => window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: social.url } }, "*")}
                        className={`p-4 rounded-xl bg-card border border-border text-muted-foreground hover:text-white ${colorClass} transition-all hover:scale-110 hover:border-transparent`}
                      >
                        <Icon className="w-6 h-6" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--theme-primary)/0.1)] to-[hsl(var(--theme-accent)/0.1)] border border-[hsl(var(--theme-primary)/0.2)]">
              <h3 className="text-lg font-bold mb-2">Available for Freelance</h3>
              <p className="text-muted-foreground text-sm">
                I&apos;m currently taking on new projects. Let&apos;s build something amazing together!
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-8 rounded-2xl bg-card border border-border">
              <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Message sent successfully! I&apos;ll get back to you soon.</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12 rounded-xl bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12 rounded-xl bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="h-12 rounded-xl bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="rounded-xl bg-background resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] hover:opacity-90 text-white font-semibold"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
