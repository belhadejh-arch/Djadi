import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, BookOpen, FileText, PenLine, Home, Award, Trash2, Inbox } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { PdfViewer } from "@/components/pdf-viewer";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const TYPE_META: Record<string, { icon: React.ElementType; color: string; labelAr: string; labelFr: string; labelEn: string }> = {
  lesson:        { icon: BookOpen,  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",      labelAr: "درس",             labelFr: "Cours",          labelEn: "Lesson" },
  exam:          { icon: FileText,  color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", labelAr: "فرض",           labelFr: "Épreuve",        labelEn: "Exam" },
  test:          { icon: PenLine,   color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",   labelAr: "اختبار",          labelFr: "Test",           labelEn: "Test" },
  homework:      { icon: Home,      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", labelAr: "واجب منزلي", labelFr: "Devoir",         labelEn: "Homework" },
  baccalaureate: { icon: Award,     color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", labelAr: "بكالوريا",    labelFr: "Baccalauréat",   labelEn: "Baccalaureate" },
};

function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/favorites`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
    staleTime: 30 * 1000,
  });
}

export default function Favorites() {
  const { t } = useLang();
  const qc = useQueryClient();
  const { data: favorites = [], isLoading } = useFavorites();
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null);

  const removeFav = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE_URL}/api/favorites/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("فشل الحذف");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  // Filter tabs
  const allTypes = ["lesson", "exam", "test", "homework", "baccalaureate"] as const;
  const [filter, setFilter] = useState<string>("all");

  const displayed = filter === "all" ? favorites : favorites.filter((f) => f.itemType === filter);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" dir="rtl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300" dir="rtl">
      {pdfViewer && (
        <PdfViewer url={pdfViewer.url} title={pdfViewer.title} onClose={() => setPdfViewer(null)} />
      )}

      {/* Header */}
      <div className="bg-gradient-to-l from-rose-600 to-pink-500 rounded-2xl p-5 text-white shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6 fill-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{t("المفضلة", "Favoris", "Favorites")}</h1>
          <p className="text-white/70 text-sm">{t(`${favorites.length} عنصر محفوظ`, `${favorites.length} élément enregistré`, `${favorites.length} saved items`)}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"}`}
        >
          {t("الكل", "Tout", "All")}
        </button>
        {allTypes.map((type) => {
          const meta = TYPE_META[type];
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === type ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"}`}
            >
              {t(meta.labelAr, meta.labelFr, meta.labelEn)}
            </button>
          );
        })}
      </div>

      {/* Favorites list */}
      {displayed.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border/50 rounded-2xl p-12 text-center space-y-3">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground font-semibold">
            {t("لا توجد عناصر في المفضلة", "Aucun favori", "No favorites yet")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {displayed.map((fav, index) => {
              const meta = TYPE_META[fav.itemType] ?? TYPE_META.lesson;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${meta.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{fav.itemTitle ?? t("عنصر", "Élément", "Item")}</p>
                    <p className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block font-semibold ${meta.color}`}>
                      {t(meta.labelAr, meta.labelFr, meta.labelEn)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFav.mutate(fav.id)}
                    disabled={removeFav.isPending}
                    className="w-9 h-9 rounded-xl bg-muted hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 flex items-center justify-center transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
