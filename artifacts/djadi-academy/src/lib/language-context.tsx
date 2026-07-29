import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "ar" | "fr" | "en";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (ar: string, fr: string, en?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  setLang: () => {},
  t: (ar) => ar,
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

  const t = (ar: string, fr: string, en?: string): string => {
    if (lang === "ar") return ar;
    if (lang === "en") return en ?? fr;
    return fr;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
