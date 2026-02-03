"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Code2, 
  Palette, 
  Rocket, 
  Coffee, 
  Music, 
  Gamepad2,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Heart,
  Zap,
  Camera,
  Book,
  Plane,
  Dumbbell,
  Film,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import { SkillsSection } from "@/components/SkillsSection";

interface SiteSettings {
  displayName: string;
  profileImage: string;
  aboutText: string;
  location: string;
  experience: string;
  status: string;
  education: string;
  interests: string;
  hobbies: string;
}

const interestIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  coding: { icon: Code2, color: "from-blue-500 to-cyan-500" },
  design: { icon: Palette, color: "from-pink-500 to-rose-500" },
  tech: { icon: Rocket, color: "from-purple-500 to-violet-500" },
  coffee: { icon: Coffee, color: "from-amber-500 to-orange-500" },
  music: { icon: Music, color: "from-green-500 to-emerald-500" },
  gaming: { icon: Gamepad2, color: "from-red-500 to-pink-500" },
  photography: { icon: Camera, color: "from-indigo-500 to-blue-500" },
  reading: { icon: Book, color: "from-yellow-500 to-amber-500" },
  travel: { icon: Plane, color: "from-sky-500 to-blue-500" },
  fitness: { icon: Dumbbell, color: "from-lime-500 to-green-500" },
  movies: { icon: Film, color: "from-violet-500 to-purple-500" },
  food: { icon: Utensils, color: "from-orange-500 to-red-500" },
  programming: { icon: Code2, color: "from-cyan-500 to-blue-500" },
};

const defaultIcon = { icon: Heart, color: "from-pink-500 to-rose-500" };

const values = [
  {
    icon: Heart,
    title: "Passionate",
    description: "I love what I do and put my heart into every project",
  },
  {
    icon: Zap,
    title: "Fast Learner",
    description: "Always eager to learn new technologies and improve",
  },
  {
    icon: Code2,
    title: "Clean Code",
    description: "Writing maintainable, readable, and efficient code",
  },
];

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    displayName: "Wanyzx",
    profileImage: "/avatar.png",
    aboutText: "I'm a passionate Full Stack Developer with a love for creating beautiful, functional, and user-friendly applications. My journey in tech started when I was curious about how websites work.\n\nToday, I specialize in building modern web applications using technologies like React, Next.js, Node.js, and various databases. I believe in writing clean, maintainable code and always strive to learn new things.\n\nWhen I'm not coding, you can find me exploring new technologies, contributing to open source projects, or enjoying some good music with a cup of coffee.",
    location: "Indonesia",
    experience: "3+ Years",
    status: "Open to Work",
    education: "Self-taught",
    interests: "Coding, Design, Tech, Coffee, Music, Gaming",
    hobbies: "Programming, Reading, Photography",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.siteSettings) {
          setSettings(prev => ({ ...prev, ...data.siteSettings }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const infoCards = [
    { icon: MapPin, label: "Location", value: settings.location },
    { icon: Calendar, label: "Experience", value: settings.experience },
    { icon: Briefcase, label: "Status", value: settings.status },
    { icon: GraduationCap, label: "Education", value: settings.education },
  ];

  const interestsList = settings.interests.split(",").map(i => i.trim()).filter(Boolean);
  const hobbiesList = settings.hobbies.split(",").map(h => h.trim()).filter(Boolean);
  const allInterests = [...new Set([...interestsList, ...hobbiesList])];

  const getInterestData = (interest: string) => {
    const key = interest.toLowerCase();
    return interestIcons[key] || defaultIcon;
  };

  const aboutParagraphs = settings.aboutText.split("\n").filter(p => p.trim());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[hsl(var(--theme-primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            About <span className="gradient-text">Me</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get to know the person behind the code
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--theme-primary))] via-[hsl(var(--theme-accent))] to-[hsl(var(--theme-secondary))] rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border">
                <Image
                  src={settings.profileImage || "/avatar.png"}
                  alt="Profile"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white">{settings.displayName}</h2>
                  <p className="text-white/80">Full Stack Developer</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {infoCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="p-4 rounded-xl bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.5)] transition-colors"
                >
                  <card.icon className="w-5 h-5 text-[hsl(var(--theme-primary))] mb-2" />
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="font-semibold text-sm">{card.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] flex items-center justify-center text-white text-sm">
                  👋
                </span>
                Hello There!
              </h3>
              <div className="space-y-4 text-muted-foreground">
                {aboutParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-bold mb-4">Interests & Hobbies</h3>
              <div className="flex flex-wrap gap-3">
                {allInterests.map((interest, index) => {
                  const { icon: Icon, color } = getInterestData(interest);
                  return (
                    <motion.div
                      key={interest}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${color} text-white text-sm font-medium`}
                    >
                      <Icon className="w-4 h-4" />
                      {interest}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="p-5 rounded-xl bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.5)] transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <value.icon className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                  </div>
                  <h4 className="font-bold mb-1">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <SkillsSection />
      </div>
    </div>
  );
}
