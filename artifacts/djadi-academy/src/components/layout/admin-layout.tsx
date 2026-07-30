import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users, BookOpen, GraduationCap, GitBranch, FileText,
  ScrollText, FlaskConical, Award, Youtube, Megaphone,
  Bell, Globe, LogOut, Menu, LayoutDashboard, ChevronRight,
  Database, ShieldCheck, BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoUrl from "@assets/IMG_0796_1785328682791.png";
import { clearUserCache } from "@/components/protected-route";
import { useLang } from "@/lib/language-context";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user } = useGetMe();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const { tk } = useLang();

  const navItems = [
    { href: "/admin",                  label: tk("admin.dashboard"),      icon: LayoutDashboard, exact: true },
    { href: "/admin/stats",            label: tk("admin.stats"),           icon: BarChart2 },
    { href: "/admin/users",            label: tk("admin.users"),           icon: Users },
    { href: "/admin/levels",           label: tk("admin.levels"),          icon: GraduationCap },
    { href: "/admin/branches",         label: tk("admin.branches"),        icon: GitBranch },
    { href: "/admin/subjects",         label: tk("admin.subjects"),        icon: BookOpen },
    { href: "/admin/lessons",          label: tk("admin.lessons"),         icon: FileText },
    { href: "/admin/exams",            label: tk("admin.exams"),           icon: ScrollText },
    { href: "/admin/tests",            label: tk("admin.tests"),           icon: FlaskConical },
    { href: "/admin/homework",         label: tk("admin.homework"),        icon: BookOpen },
    { href: "/admin/baccalaureates",   label: tk("admin.baccalaureates"),  icon: Award },
    { href: "/admin/review-channels",  label: tk("admin.reviewChannels"),  icon: Youtube },
    { href: "/admin/announcements",    label: tk("admin.announcements"),   icon: Megaphone },
    { href: "/admin/notifications",    label: tk("admin.notifications"),   icon: Bell },
    { href: "/admin/language-settings",label: tk("admin.langSettings"),    icon: Globe },
    { href: "/admin/backup",           label: tk("admin.backup"),          icon: Database },
    { href: "/admin/audit-logs",       label: tk("admin.auditLogs"),       icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        clearUserCache();
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
    });
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location === href || location.startsWith(href + "/");
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-card border-l w-64 shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b shrink-0">
        <img src={logoUrl} alt={tk("app.name")} className="w-9 h-9 object-contain" />
        <div>
          <p className="font-bold text-sm text-primary">{tk("app.name")}</p>
          <p className="text-xs text-muted-foreground">{tk("admin.panel")}</p>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
            <span
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer min-h-[40px]",
                isActive(item.href, item.exact)
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t space-y-2 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {user?.fullName?.charAt(0) ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{user?.fullName}</p>
            <p className="text-[10px] text-muted-foreground">{tk("admin.superAdmin")}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5 ml-2" />
          {tk("admin.logout")}
        </Button>
      </div>
    </aside>
  );

  return (
    /* Fixed viewport — only the content area scrolls */
    <div className="h-[100dvh] overflow-hidden bg-background text-foreground flex" dir="rtl">

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex h-full">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card shrink-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm">{tk("admin.panel")}</span>
          <div className="w-9" />
        </header>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 px-6 py-3 text-xs text-muted-foreground border-b bg-muted/30 shrink-0">
          <Link href="/admin">
            <span className="hover:text-foreground cursor-pointer">{tk("admin.breadcrumb")}</span>
          </Link>
          {(() => {
            const current = navItems.find((n) => isActive(n.href, n.exact));
            if (!current || current.href === "/admin") return null;
            return (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{current.label}</span>
              </>
            );
          })()}
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
