import { createContext, useContext, useState, ReactNode } from "react";
import { translations, type TranslationKey } from "./translations";

export type Lang = "ar" | "fr" | "en";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Inline translation: pass Arabic, French, optional English */
  t: (ar: string, fr: string, en?: string) => string;
  /** Key-based translation from the central catalog — easy to extend with new languages */
  tk: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  setLang: () => {},
  t: (ar) => ar,
  tk: (key) => translations[key].ar,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("djadi_lang") as Lang) || "ar";
    } catch {
      return "ar";
    }
  });

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem("djadi_lang", next);
    } catch {}
  };

  /** Inline 2-arg or 3-arg translation — backward-compatible with existing call sites */
  const t = (ar: string, fr: string, en?: string): string => {
    if (lang === "ar") return ar;
    if (lang === "en") return en ?? fr;
    return fr;
  };

  /** Key-based translation — preferred for new code; adding a new language only requires
   *  updating the translations catalog, not individual call sites. */
  const tk = (key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    if (lang === "ar") return entry.ar;
    if (lang === "en") return entry.en;
    return entry.fr;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tk }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
