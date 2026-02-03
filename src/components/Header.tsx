"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { 
  Home, 
  User, 
  FileText, 
  Code, 
  ShoppingBag, 
  Mail, 
  Github, 
  Menu, 
  X, 
  ChevronDown, 
  Music, 
  Sparkles, 
  Wand2, 
  Wrench, 
  Inbox, 
  Upload, 
  Library, 
  Layers, 
  Lightbulb 
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Home", mobileLabel: "Home", icon: Home },
  { href: "/about", label: "About", mobileLabel: "About", icon: User },
  { href: "/blog", label: "Blog", mobileLabel: "Blog", icon: FileText },
  { href: "/projects", label: "Projects", mobileLabel: "Projects", icon: Github },
        { href: "/api-docs", label: "Docs", mobileLabel: "API Docs", icon: Code },



  { href: "/shop", label: "Shop", mobileLabel: "Shop", icon: ShoppingBag },
  { href: "/contact", label: "Contact", mobileLabel: "Contact", icon: Mail },
];

const featureItems = [
  { href: "/features/wanyzx-ai", label: "Wanyzx AI", icon: Sparkles, description: "Intelligent AI Assistant" },
  { href: "/music", label: "Music Player", icon: Music, description: "Putar dan download lagu" },
  { href: "/library", label: "Code Library", icon: Library, description: "Koleksi kode & script" },
];

const toolItems = [
  { href: "/ai-image", label: "AI Image", icon: Wand2, description: "Transform gambar dengan AI" },
  { href: "/tools/web-parser", label: "Web Parser", icon: Code, description: "AI Scraper & Parser" },
  { href: "/tools/tempmail", label: "TempMail", icon: Inbox, description: "Email sementara gratis" },
  { href: "/tools/uploader", label: "Uploader", icon: Upload, description: "Upload dan share file" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
        setFeaturesOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFeatureActive = featureItems.some(item => pathname === item.href);
  const isToolActive = toolItems.some(item => pathname === item.href);

  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-50">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 backdrop-blur-xl bg-background/70 border border-border/50 rounded-2xl shadow-lg shadow-black/5">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl tracking-tight dark:text-white text-black font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                /wanyzx
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}

              <div ref={featuresRef} className="relative">
                <button
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                    isFeatureActive || featuresOpen
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {(isFeatureActive || featuresOpen) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <Layers className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">Features</span>
                  <ChevronDown className={`relative z-10 w-4 h-4 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {featuresOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="p-2">
                        {featureItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setFeaturesOpen(false)}
                              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-accent"
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20" : "bg-accent"}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      <Link
                        href="/request"
                        onClick={() => setFeaturesOpen(false)}
                        className="block px-4 py-3 bg-amber-500/10 border-t border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                      >
                        <p className="text-xs text-amber-500 flex items-center gap-1 font-medium">
                          <Lightbulb className="w-3 h-3" />
                          Request fitur?
                        </p>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={toolsRef} className="relative">
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                    isToolActive || toolsOpen
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {(isToolActive || toolsOpen) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <Wrench className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">Tools</span>
                  <ChevronDown className={`relative z-10 w-4 h-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {toolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="p-2">
                        {toolItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setToolsOpen(false)}
                              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-accent"
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20" : "bg-accent"}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-background border-l border-border z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="text-xl font-bold">/wanyzx</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto font-medium">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
                  </div>
                  {featureItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</p>
                  </div>
                  {toolItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
