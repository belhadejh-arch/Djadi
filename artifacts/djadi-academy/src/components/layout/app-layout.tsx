import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import {
  Home,
  BookOpen,
  Heart,
  LogOut,
  Sun,
  Moon,
  Bell,
  Globe,
  Calculator,
  FlaskConical,
  Youtube,
  Settings,
  GraduationCap,
} from "lucide-react";
import { useTheme } from "../theme-provider";
import { useLang } from "@/lib/language-context";
import { useNotifications } from "@/lib/notifications-context";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoUrl from "@assets/IMG_0796_1785328682791.png";
import { clearUserCache } from "@/components/protected-route";

interface LayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, tk } = useLang();
  const { unreadCount } = useNotifications();

  const cycleLang = () => {
    const order: ("ar" | "fr" | "en")[] = ["ar", "fr", "en"];
    setLang(order[(order.indexOf(lang) + 1) % order.length]);
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        clearUserCache();
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
    });
  };

  const bottomNavItems = [
    { href: "/dashboard",             label: tk("nav.home"),           icon: Home },
    { href: "/grade-calculator",      label: tk("nav.calculator"),      icon: Calculator },
    { href: "/scientific-calculator", label: tk("nav.sciCalcShort"),    icon: FlaskConical },
    { href: "/review-channels",       label: tk("nav.reviewChannels"),  icon: Youtube },
    { href: "/settings",              label: tk("nav.settings"),        icon: Settings },
  ];

  const sidebarNavItems = [
    { href: "/dashboard",             label: tk("nav.home"),           icon: Home },
    { href: "/subjects",              label: tk("nav.subjects"),        icon: BookOpen },
    { href: "/baccalaureate",         label: tk("nav.baccalaureate"),   icon: GraduationCap },
    { href: "/favorites",             label: tk("nav.favorites"),       icon: Heart },
    { href: "/grade-calculator",      label: tk("nav.calculator"),      icon: Calculator },
    { href: "/scientific-calculator", label: tk("nav.sciCalc"),         icon: FlaskConical },
    { href: "/review-channels",       label: tk("nav.reviewChannels"),  icon: Youtube },
    { href: "/settings",              label: tk("nav.settings"),        icon: Settings },
  ];

  return (
    /* Fixed viewport — content scrolls inside, not the whole page */
    <div className="h-[100dvh] overflow-hidden bg-background text-foreground flex flex-col md:flex-row" dir="rtl">

      {/* ── Mobile Header ──────────────────────────────────────────────────── */}
      <header className="md:hidden shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b z-50">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt={tk("app.name")} className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-primary">{tk("app.name")}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <Button variant="ghost" size="icon" onClick={cycleLang} className="relative" title={lang === "ar" ? "FR" : lang === "fr" ? "EN" : "AR"}>
            <Globe className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold leading-none bg-primary text-primary-foreground rounded px-0.5">
              {lang.toUpperCase()}
            </span>
          </Button>

          {/* Dark / light toggle */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl || ""} />
            <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col bg-card border-l h-full overflow-y-auto">
        <div className="p-6 flex items-center gap-4 border-b shrink-0">
          <img src={logoUrl} alt={tk("app.name")} className="w-12 h-12 object-contain" />
          <div>
            <h1 className="font-bold text-xl text-primary">{tk("app.name")}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-sans" dir="ltr">
              Mounassata Djadi
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {sidebarNavItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[44px] ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar>
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground">{user?.grade || "—"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={cycleLang} className="relative" title={lang === "ar" ? "FR" : lang === "fr" ? "EN" : "AR"}>
                <Globe className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 text-[7px] font-bold leading-none bg-primary text-primary-foreground rounded px-0.5">
                  {lang.toUpperCase()}
                </span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -left-0.5 min-w-[16px] h-[16px] bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 ml-2" />
            {tk("common.logout")}
          </Button>
        </div>
      </aside>

      {/* ── Main Content — scrolls independently ───────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 min-w-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────────────── */}
      <nav className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 bg-card border-t flex items-center justify-around py-1.5 z-50" style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}>
        {bottomNavItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl min-w-0 flex-1 min-h-[44px] justify-center transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] font-medium leading-tight text-center w-full truncate px-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
