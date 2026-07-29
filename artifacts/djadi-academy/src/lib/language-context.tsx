import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "ar" | "fr";

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (ar: string, fr: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  toggleLang: () => {},
  t: (ar) => ar,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("djadi_lang") as Lang) || "ar";
    } catch {
      return "ar";
    }
  });

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === "ar" ? "fr" : "ar";
      try {
        localStorage.setItem("djadi_lang", next);
      } catch {}
      return next;
    });
  };

  const t = (ar: string, fr: string) => (lang === "ar" ? ar : fr);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
