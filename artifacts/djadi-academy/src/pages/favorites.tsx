/**
 * Favorites — tabbed bookmarks per content type
 * Tabs: دروسي / فروضي / اختباراتي / واجباتي المنزلية
 * Features: reorder (up/down), move between tabs (n/a – type is fixed), delete
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, BookOpen, FileText, PenLine, Home, Award,
  Trash2, Inbox, ChevronUp, ChevronDown,
} from "lucide-react";
import { useLang } from "@/lib/language-context";
import { PdfViewer } from "@/components/pdf-viewer";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type FavType = "lesson" | "exam" | "test" | "homework" | "baccalaureate";

const TABS: {
  id: FavType;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}[] = [
  { id: "lesson",        labelAr: "دروسي",              labelFr: "Mes cours",       labelEn: "My Lessons",    icon: BookOpen, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",       gradientFrom: "from-blue-600",    gradientTo: "to-indigo-500" },
  { id: "exam",          labelAr: "فروضي",              labelFr: "Mes épreuves",    labelEn: "My Exams",      icon: FileText, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", gradientFrom: "from-purple-600",  gradientTo: "to-violet-500" },
  { id: "test",          labelAr: "اختباراتي",          labelFr: "Mes tests",       labelEn: "My Tests",      icon: PenLine,  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",     gradientFrom: "from-amber-500",   gradientTo: "to-orange-400" },
  { id: "homework",      labelAr: "واجباتي المنزلية",   labelFr: "Mes devoirs",     labelEn: "My Homework",   icon: Home,     color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", gradientFrom: "from-emerald-600", gradientTo: "to-teal-500" },
];

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
  const [activeTab, setActiveTab] = useState<FavType>("lesson");
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const removeFav = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE_URL}/api/favorites/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  // ── Reorder ─────────────────────────────────────────────────────────────────
  const reorderMut = useMutation({
    mutationFn: async ({ itemType, orderedIds }: { itemType: FavType; orderedIds: number[] }) => {
      const res = await fetch(`${BASE_URL}/api/favorites/reorder`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, orderedIds }),
      });
      if (!res.ok) throw new Error("فشل إعادة الترتيب");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  function move(item: any, direction: "up" | "down", items: any[]) {
    const idx = items.findIndex((i) => i.id === item.id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === items.length - 1) return;
    const newItems = [...items];
    const swap = direction === "up" ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swap]] = [newItems[swap], newItems[idx]];
    reorderMut.mutate({
      itemType: item.itemType as FavType,
      orderedIds: newItems.map((i) => i.id),
    });
    // Optimistic update
    qc.setQueryData(["favorites"], (old: any[]) => {
      if (!old) return old;
      const withoutType = old.filter((f) => f.itemType !== item.itemType);
      return [...withoutType, ...newItems];
    });
  }

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const displayed = favorites.filter((f) => f.itemType === activeTab);
  const totalCount = favorites.length;

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" dir="rtl">
        <div className="h-28 bg-muted rounded-2xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-9 w-24 bg-muted rounded-full" />)}
        </div>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300" dir="rtl">
      {pdfViewer && (
        <PdfViewer url={pdfViewer.url} title={pdfViewer.title} onClose={() => setPdfViewer(null)} />
      )}

      {/* Header banner */}
      <div className={`bg-gradient-to-l ${currentTab.gradientFrom} ${currentTab.gradientTo} rounded-2xl p-5 text-white shadow-lg flex items-center gap-4 transition-all duration-500`}>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6 fill-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{t("المفضلة", "Favoris", "Favorites")}</h1>
          <p className="text-white/70 text-sm">
            {t(`${totalCount} عنصر محفوظ`, `${totalCount} élément enregistré`, `${totalCount} saved items`)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const count = favorites.filter((f) => f.itemType === tab.id).length;
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(tab.labelAr, tab.labelFr, tab.labelEn)}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[1.25rem] text-center ${
                  isActive ? "bg-white/25 text-white" : "bg-primary/15 text-primary"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items list */}
      <AnimatePresence mode="wait">
        {displayed.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-card border-2 border-dashed border-border/50 rounded-2xl p-12 text-center space-y-3"
          >
            <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground font-semibold">
              {t(
                `لا توجد عناصر في ${currentTab.labelAr}`,
                `Aucun élément dans ${currentTab.labelFr}`,
                `Nothing in ${currentTab.labelEn} yet`,
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(
                "اضغط على ❤️ بجانب أي عنصر لحفظه هنا",
                "Appuyez sur ❤️ pour enregistrer un élément",
                "Tap ❤️ next to any item to save it here",
              )}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
          >
            {/* Reorder hint */}
            {displayed.length > 1 && (
              <p className="text-xs text-muted-foreground px-1 flex items-center gap-1">
                <ChevronUp className="w-3 h-3" />
                {t("استخدم الأسهم لإعادة الترتيب", "Utilisez les flèches pour réorganiser", "Use arrows to reorder")}
              </p>
            )}

            <AnimatePresence>
              {displayed.map((fav, index) => {
                const meta = TABS.find((tb) => tb.id === fav.itemType)!;
                const Icon = meta?.icon ?? BookOpen;
                const isFirst = index === 0;
                const isLast  = index === displayed.length - 1;

                return (
                  <motion.div
                    key={fav.id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    {/* Reorder arrows */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        disabled={isFirst || reorderMut.isPending}
                        onClick={() => move(fav, "up", displayed)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title={t("نقل للأعلى", "Déplacer vers le haut", "Move up")}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={isLast || reorderMut.isPending}
                        onClick={() => move(fav, "down", displayed)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title={t("نقل للأسفل", "Déplacer vers le bas", "Move down")}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Icon */}
                    <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${meta?.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-sm">{fav.itemTitle ?? t("عنصر", "Élément", "Item")}</p>
                      <p className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block font-semibold ${meta?.color}`}>
                        {t(meta?.labelAr, meta?.labelFr, meta?.labelEn)}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFav.mutate(fav.id)}
                      disabled={removeFav.isPending}
                      className="w-9 h-9 rounded-xl bg-muted hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 flex items-center justify-center transition-colors shrink-0"
                      title={t("حذف", "Supprimer", "Delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
