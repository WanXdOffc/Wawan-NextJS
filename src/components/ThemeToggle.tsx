"use client";

import { useTheme } from "next-themes";
import { usePalette } from "./ThemeProvider";
import { Moon, Sun, Palette, Check, Settings2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (max + min) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { palette, changePalette, colorPalettes, customPalette, setCustomPalette } = usePalette();
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [customColors, setCustomColors] = useState({
    name: "Custom Palette",
    primary: "#6366f1",
    accent: "#a855f7",
    secondary: "#3b82f6",
    tertiary: "#1e1b4b",
    quaternary: "#ec4899"
  });

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleSaveCustom = () => {
    setCustomPalette({
      name: customColors.name,
      primary: hexToHsl(customColors.primary),
      accent: hexToHsl(customColors.accent),
      secondary: hexToHsl(customColors.secondary),
      tertiary: hexToHsl(customColors.tertiary),
      quaternary: hexToHsl(customColors.quaternary),
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Animated Dark/Light Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative h-10 w-10 overflow-hidden rounded-full hover:bg-accent group"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {theme === "dark" ? (
            <motion.div
              key="moon"
              initial={{ y: -40, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 40, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Moon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: -180, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 180, scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 15 }}
            >
              <Sun className="h-5 w-5 text-amber-500 group-hover:text-amber-400 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Palette Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-accent group transition-all"
          >
            <Palette className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
            <span className="sr-only">Switch palette</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2 backdrop-blur-xl bg-background/80 border-border/50">
          <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Select Palette
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />
          <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto pr-1">
            {Object.entries(colorPalettes).map(([key, val]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => changePalette(key)}
                className={`flex items-center justify-between gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  palette === key 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold tracking-tight">{val.name}</span>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-6 rounded-full" style={{ background: `hsl(${val.primary})` }} />
                    <div className="h-1.5 w-4 rounded-full" style={{ background: `hsl(${val.accent})` }} />
                    <div className="h-1.5 w-4 rounded-full" style={{ background: `hsl(${val.secondary})` }} />
                    <div className="h-1.5 w-3 rounded-full" style={{ background: `hsl(${val.tertiary})` }} />
                  </div>
                </div>
                {palette === key && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}
              </DropdownMenuItem>
            ))}
            
            {customPalette && (
              <DropdownMenuItem
                onClick={() => changePalette("custom")}
                className={`flex items-center justify-between gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  palette === "custom" 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold tracking-tight">{customPalette.name}</span>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-6 rounded-full" style={{ background: `hsl(${customPalette.primary})` }} />
                    <div className="h-1.5 w-4 rounded-full" style={{ background: `hsl(${customPalette.accent})` }} />
                    <div className="h-1.5 w-4 rounded-full" style={{ background: `hsl(${customPalette.secondary})` }} />
                    <div className="h-1.5 w-3 rounded-full" style={{ background: `hsl(${customPalette.tertiary})` }} />
                  </div>
                </div>
                {palette === "custom" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            )}
          </div>
          
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2.5 hover:bg-primary hover:text-primary-foreground transition-colors group"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Custom Palette</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Palette Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-2xl bg-background/90 border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Create Palette</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Choose your favorite colors for your personal theme.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Palette Name</Label>
              <Input
                id="name"
                value={customColors.name}
                onChange={(e) => setCustomColors({ ...customColors, name: e.target.value })}
                className="rounded-xl border-border/50 bg-background/50 font-bold"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className="w-12 h-10 p-1 rounded-lg border-border/50 bg-background/50 cursor-pointer"
                  />
                  <Input
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className="flex-1 rounded-xl border-border/50 bg-background/50 font-mono text-xs"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accent</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customColors.accent}
                    onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                    className="w-12 h-10 p-1 rounded-lg border-border/50 bg-background/50 cursor-pointer"
                  />
                  <Input
                    value={customColors.accent}
                    onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                    className="flex-1 rounded-xl border-border/50 bg-background/50 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Secondary</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                    className="w-12 h-10 p-1 rounded-lg border-border/50 bg-background/50 cursor-pointer"
                  />
                  <Input
                    value={customColors.secondary}
                    onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                    className="flex-1 rounded-xl border-border/50 bg-background/50 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tertiary</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customColors.tertiary}
                    onChange={(e) => setCustomColors({ ...customColors, tertiary: e.target.value })}
                    className="w-12 h-10 p-1 rounded-lg border-border/50 bg-background/50 cursor-pointer"
                  />
                  <Input
                    value={customColors.tertiary}
                    onChange={(e) => setCustomColors({ ...customColors, tertiary: e.target.value })}
                    className="flex-1 rounded-xl border-border/50 bg-background/50 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quaternary / Background Glow</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customColors.quaternary}
                    onChange={(e) => setCustomColors({ ...customColors, quaternary: e.target.value })}
                    className="w-12 h-10 p-1 rounded-lg border-border/50 bg-background/50 cursor-pointer"
                  />
                  <Input
                    value={customColors.quaternary}
                    onChange={(e) => setCustomColors({ ...customColors, quaternary: e.target.value })}
                    className="flex-1 rounded-xl border-border/50 bg-background/50 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleSaveCustom}
              className="w-full rounded-xl py-6 font-black uppercase tracking-widest"
            >
              Apply Custom Palette
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
