import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetMe } from "@workspace/api-client-react";
import { Languages, ChevronRight } from "lucide-react";
import { useBranch, type ThirdLanguage } from "@/lib/use-branch";

const LANGUAGES: {
  id: ThirdLanguage;
  nameAr: string;
  nameFr: string;
  flag: string;
  color: string;
}[] = [
  {
    id: "german",
    nameAr: "اللغة الألمانية",
    nameFr: "Langue Allemande",
    flag: "🇩🇪",
    color: "#1d4ed8",
  },
  {
    id: "spanish",
    nameAr: "اللغة الإسبانية",
    nameFr: "Langue Espagnole",
    flag: "🇪🇸",
    color: "#b91c1c",
  },
  {
    id: "italian",
    nameAr: "اللغة الإيطالية",
    nameFr: "Langue Italienne",
    flag: "🇮🇹",
    color: "#15803d",
  },
];

export default function LanguageSelect() {
  const [, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const grade = user?.grade ?? undefined;

  const { setThirdLanguage } = useBranch(user?.id, grade);

  const handleSelect = (lang: ThirdLanguage) => {
    setThirdLanguage(lang);
    setLocation("/subjects");
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-6"
      dir="rtl"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full mb-4">
            <span>آداب ولغات أجنبية</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </div>

          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-pink-100 dark:bg-pink-900/30">
            <Languages className="w-8 h-8 text-pink-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            اختر اللغة الأجنبية الثالثة
          </h1>
          <p className="text-muted-foreground" dir="ltr">
            Choisissez votre 3ème langue étrangère
          </p>
        </motion.div>

        {/* Language cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LANGUAGES.map((lang, index) => (
            <motion.div
              key={lang.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                onClick={() => handleSelect(lang.id)}
                className="w-full flex flex-col items-center rounded-2xl border-2 border-border bg-card hover:border-primary/60 hover:bg-muted/40 hover:shadow-md transition-all p-8 group"
              >
                {/* Flag */}
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {lang.flag}
                </span>

                {/* Name */}
                <h2 className="text-xl font-bold mb-1 text-center group-hover:text-primary transition-colors">
                  {lang.nameAr}
                </h2>
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {lang.nameFr}
                </p>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
