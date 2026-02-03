"use client";

import Link from "next/link";
import { Github, Twitter, Instagram, Linkedin, Heart, Youtube, Facebook } from "lucide-react";
import { useEffect, useState } from "react";

interface SocialMedia {
  platform: string;
  url: string;
  enabled: boolean;
}

interface SiteSettings {
  displayName: string;
  footerSocialMedia: SocialMedia[];
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  facebook: Facebook,
};

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({
    displayName: "Wanyzx",
    footerSocialMedia: [],
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

  const activeSocials = settings.footerSocialMedia?.filter(s => s.enabled && s.url) || [];

  return (
    <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="inline-block mb-4">
                <span className="text-2xl font-black tracking-tighter text-foreground">
                  /{settings.displayName.toLowerCase()}
                </span>
              </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Building digital experiences with passion and precision. Always learning, always creating.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "About" },
                { href: "/blog", label: "Blog" },
                { href: "/projects", label: "Projects" },
                    { href: "/wanyzx-ai/docs", label: "API Docs" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-3">
              {activeSocials.length > 0 ? (
                activeSocials.map((social) => {
                  const Icon = socialIcons[social.platform];
                  if (!Icon) return null;
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })
              ) : (
                <>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {settings.displayName}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> using Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
