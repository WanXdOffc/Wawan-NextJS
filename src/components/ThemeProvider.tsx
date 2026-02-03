"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect, useState, createContext, useContext } from "react";

interface PaletteColors {
  name: string;
  primary: string;
  accent: string;
  secondary: string;
  tertiary: string;
  quaternary?: string;
}

const colorPalettes: Record<string, PaletteColors> = {
  ocean: {
    name: "Oceanic",
    primary: "199 89% 48%",
    accent: "217 91% 60%",
    secondary: "190 90% 50%",
    tertiary: "210 100% 20%",
  },
  forest: {
    name: "Evergreen",
    primary: "142 71% 45%",
    accent: "160 84% 39%",
    secondary: "120 50% 70%",
    tertiary: "150 40% 20%",
  },
  candy: {
    name: "Candy Crush",
    primary: "322 81% 55%",
    accent: "280 100% 70%",
    secondary: "190 90% 60%",
    tertiary: "340 70% 40%",
  },
  midnight: {
    name: "Midnight",
    primary: "262 83% 58%",
    accent: "230 100% 60%",
    secondary: "280 80% 50%",
    tertiary: "250 50% 20%",
  },
  sunset: {
    name: "Sunfire",
    primary: "38 92% 50%",
    accent: "15 90% 55%",
    secondary: "346 84% 50%",
    tertiary: "25 60% 30%",
  },
    mono: {
      name: "Minimalist",
      primary: "0 0% 50%",
      accent: "0 0% 20%",
      secondary: "0 0% 80%",
      tertiary: "0 0% 10%",
    },
    cyberpunk: {
      name: "Cyberpunk",
      primary: "300 100% 50%",
      accent: "180 100% 50%",
      secondary: "60 100% 50%",
      tertiary: "280 100% 20%",
    },
    nordic: {
      name: "Nordic Frost",
      primary: "210 20% 50%",
      accent: "190 30% 60%",
      secondary: "200 10% 80%",
      tertiary: "220 30% 20%",
    },
    royal: {
      name: "Royal Gold",
      primary: "45 100% 50%",
      accent: "35 90% 40%",
      secondary: "50 80% 70%",
      tertiary: "40 100% 10%",
    },
    rose: {
      name: "Rose Garden",
      primary: "350 70% 60%",
      accent: "330 60% 50%",
      secondary: "340 40% 80%",
      tertiary: "350 80% 20%",
    }
  };

export { colorPalettes };

interface PaletteContextType {
  palette: string;
  changePalette: (key: string) => void;
  colorPalettes: typeof colorPalettes;
  customPalette: PaletteColors | null;
  setCustomPalette: (palette: PaletteColors) => void;
}

const PaletteContext = createContext<PaletteContextType>({
  palette: "ocean",
  changePalette: () => {},
  colorPalettes,
  customPalette: null,
  setCustomPalette: () => {},
});

export const usePalette = () => useContext(PaletteContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [palette, setPalette] = useState("ocean");
  const [customPalette, setCustomPaletteState] = useState<PaletteColors | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem("color-palette") || "ocean";
    const savedCustom = sessionStorage.getItem("custom-palette");
    
    if (savedCustom) {
      try {
        setCustomPaletteState(JSON.parse(savedCustom));
      } catch (e) {
        console.error("Failed to parse custom palette", e);
      }
    }

    setPalette(saved);
    applyPalette(saved, savedCustom ? JSON.parse(savedCustom) : null);
  }, []);

  const applyPalette = (key: string, customP: PaletteColors | null = null) => {
    let p: PaletteColors;
    if (key === "custom" && (customP || customPalette)) {
      p = customP || customPalette!;
    } else {
      p = colorPalettes[key as keyof typeof colorPalettes] || colorPalettes.ocean;
    }
    
    document.documentElement.style.setProperty("--theme-primary", p.primary);
    document.documentElement.style.setProperty("--theme-accent", p.accent);
    document.documentElement.style.setProperty("--theme-secondary", p.secondary);
    document.documentElement.style.setProperty("--theme-tertiary", p.tertiary);
    if (p.quaternary) {
      document.documentElement.style.setProperty("--theme-quaternary", p.quaternary);
    }
    
    // Also update shadcn primary for the solid buttons requirement
    // Since primary buttons use hsl(var(--primary)), we should update it
    document.documentElement.style.setProperty("--primary", p.primary);
  };

  const changePalette = (key: string) => {
    setPalette(key);
    sessionStorage.setItem("color-palette", key);
    applyPalette(key);
  };

  const setCustomPalette = (p: PaletteColors) => {
    setCustomPaletteState(p);
    sessionStorage.setItem("custom-palette", JSON.stringify(p));
    setPalette("custom");
    sessionStorage.setItem("color-palette", "custom");
    applyPalette("custom", p);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <PaletteContext.Provider value={{ palette, changePalette, colorPalettes, customPalette, setCustomPalette }}>
        {children}
      </PaletteContext.Provider>
    </NextThemesProvider>
  );
}
