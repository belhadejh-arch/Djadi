import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { Home, BookOpen, User as UserIcon, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../theme-provider";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoUrl from "@assets/IMG_0796_1785328682791.png";

interface LayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "الرئيسية", labelFr: "Accueil", icon: Home },
    { href: "/subjects", label: "المواد", labelFr: "Matières", icon: BookOpen },
    { href: "/lessons", label: "الدروس", labelFr: "Leçons", icon: UserIcon },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row" dir="rtl">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Djadi Academy" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-primary">أكاديمية جادي</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl || ""} />
            <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-card border-l min-h-screen sticky top-0">
        <div className="p-6 flex items-center gap-4 border-b">
          <img src={logoUrl} alt="Djadi Academy" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="font-bold text-xl text-primary">أكاديمية جادي</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-sans" dir="ltr">Djadi Academy</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} className={`flex items-center justify-between p-3 rounded-xl transition-all ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}>
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-semibold text-lg">{item.label}</span>
                </div>
                <span className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`} dir="ltr">{item.labelFr}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground">{user?.grade || "No grade"}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex items-center justify-around p-2 pb-safe z-50">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
