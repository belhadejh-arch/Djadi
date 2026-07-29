/**
 * FavoriteButton — toggle favorite for any content item (lesson/exam/test/homework/baccalaureate)
 * Usage: <FavoriteButton itemType="lesson" itemId={123} itemTitle="الدرس" />
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type FavItemType = "lesson" | "exam" | "test" | "homework" | "baccalaureate";

interface FavoriteButtonProps {
  itemType: FavItemType;
  itemId: number;
  itemTitle?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function useFavoriteStatus(itemType: FavItemType, itemId: number) {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/favorites`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
    select: (favs: any[]) =>
      favs.find((f) => f.itemType === itemType && f.itemId === itemId) ?? null,
    staleTime: 30 * 1000,
  });
}

export function FavoriteButton({ itemType, itemId, itemTitle, className, size = "md" }: FavoriteButtonProps) {
  const { t } = useLang();
  const qc = useQueryClient();

  const { data: existingFav } = useFavoriteStatus(itemType, itemId);
  const isFavorited = !!existingFav;

  const toggle = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}/api/favorites`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, itemTitle }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };
  const iconSizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle.mutate(); }}
      disabled={toggle.isPending}
      title={isFavorited ? t("إزالة من المفضلة", "Retirer des favoris", "Remove from favorites") : t("إضافة للمفضلة", "Ajouter aux favoris", "Add to favorites")}
      className={cn(
        `rounded-full flex items-center justify-center transition-all`,
        sizeClasses[size],
        isFavorited
          ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50"
          : "bg-muted text-muted-foreground hover:bg-rose-100 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400",
        toggle.isPending && "opacity-60 cursor-wait",
        className
      )}
    >
      <Heart className={cn(iconSizeClasses[size], isFavorited && "fill-current")} />
    </button>
  );
}
