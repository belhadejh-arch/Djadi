import { Link } from "wouter";
import { ChevronRight, Moon, Sun, Globe, Bell, LogOut, User, Lock, Info } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/lib/language-context";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const { data: user } = useGetMe();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() }),
    });
  };

  const sections = [
    {
      title: "الحساب",
      items: [
        {
          icon: User,
          label: "معلومات الحساب",
          sublabel: user?.fullName ?? "—",
          action: null,
          color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
        },
      ],
    },
    {
      title: "المظهر واللغة",
      items: [
        {
          icon: theme === "dark" ? Moon : Sun,
          label: "الوضع المظلم",
          sublabel: theme === "dark" ? "مفعّل" : "معطّل",
          action: (
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
          ),
          color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
        },
        {
          icon: Globe,
          label: "لغة الواجهة",
          sublabel: lang === "ar" ? "العربية" : "Français",
          action: (
            <Switch
              checked={lang === "fr"}
              onCheckedChange={toggleLang}
            />
          ),
          color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
        },
      ],
    },
    {
      title: "الإشعارات",
      items: [
        {
          icon: Bell,
          label: "إشعارات التطبيق",
          sublabel: "إدارة إشعاراتك",
          action: <Link href="/notifications" className="text-primary text-sm font-medium">عرض</Link>,
          color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
        },
      ],
    },
    {
      title: "عن التطبيق",
      items: [
        {
          icon: Info,
          label: "أكاديمية جادي",
          sublabel: "الإصدار 1.0.0",
          action: null,
          color: "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white/30">
            <AvatarImage src={user?.avatarUrl ?? ""} />
            <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
              {user?.fullName?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-extrabold">{user?.fullName ?? "المستخدم"}</h2>
            <p className="text-white/70 text-sm">
              {user?.grade === "troisieme"
                ? "السنة الثالثة ثانوي"
                : user?.grade === "deuxieme"
                ? "السنة الثانية ثانوي"
                : "السنة الأولى ثانوي"}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            {section.title}
          </h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm divide-y divide-border">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                </div>
                {item.action}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-card rounded-2xl border border-destructive/30 p-4 flex items-center gap-4 text-destructive hover:bg-destructive/5 transition-all shadow-sm"
      >
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <LogOut className="w-5 h-5 text-red-500" />
        </div>
        <span className="font-bold">تسجيل الخروج</span>
      </button>
    </div>
  );
}
