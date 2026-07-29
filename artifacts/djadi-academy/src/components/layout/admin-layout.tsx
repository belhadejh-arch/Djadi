import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users, BookOpen, GraduationCap, GitBranch, FileText,
  ScrollText, FlaskConical, Award, Youtube, Megaphone,
  Bell, Globe, LogOut, Menu, X, LayoutDashboard, ChevronRight, Database, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoUrl from "@assets/IMG_0796_1785328682791.png";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/levels", label: "المستويات", icon: GraduationCap },
  { href: "/admin/branches", label: "الشعب", icon: GitBranch },
  { href: "/admin/subjects", label: "المواد", icon: BookOpen },
  { href: "/admin/lessons", label: "الدروس", icon: FileText },
  { href: "/admin/exams", label: "الفروض", icon: ScrollText },
  { href: "/admin/tests", label: "الاختبارات", icon: FlaskConical },
  { href: "/admin/homework", label: "الواجبات المنزلية", icon: BookOpen },
  { href: "/admin/baccalaureates", label: "البكالوريات", icon: Award },
  { href: "/admin/review-channels", label: "قنوات المراجعة", icon: Youtube },
  { href: "/admin/announcements", label: "الإعلانات", icon: Megaphone },
  { href: "/admin/notifications", label: "الإشعارات", icon: Bell },
  { href: "/admin/language-settings", label: "اللغات", icon: Globe },
  { href: "/admin/backup", label: "النسخ الاحتياطي", icon: Database },
  { href: "/admin/audit-logs", label: "سجل المراجعة", icon: ShieldCheck },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user } = useGetMe();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
    });
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location === href || location.startsWith(href + "/");
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-card border-l w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b">
        <img src={logoUrl} alt="منصة جعدي" className="w-9 h-9 object-contain" />
        <div>
          <p className="font-bold text-sm text-primary">منصة جعدي</p>
          <p className="text-xs text-muted-foreground">لوحة الإدارة</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
          >
            <span
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                isActive(item.href, item.exact)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {user?.fullName?.charAt(0) ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{user?.fullName}</p>
            <p className="text-[10px] text-muted-foreground">مدير عام</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex" dir="rtl">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card sticky top-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm">لوحة الإدارة</span>
          <div className="w-9" />
        </header>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 px-6 py-3 text-xs text-muted-foreground border-b bg-muted/30">
          <Link href="/admin"><span className="hover:text-foreground cursor-pointer">الرئيسية</span></Link>
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
