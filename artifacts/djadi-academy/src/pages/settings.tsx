import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Lock, Globe, Moon, Sun, Bell, BellOff, GraduationCap,
  Info, Shield, LogOut, ChevronLeft, Eye, EyeOff, X, Check,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/lib/language-context";
import type { Lang } from "@/lib/language-context";
import { useNotifications } from "@/lib/notifications-context";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Notifications enabled state (localStorage) ────────────────────────────
const NOTIF_KEY = "djadi_notif_enabled";
function getNotifEnabled() {
  try { return localStorage.getItem(NOTIF_KEY) !== "false"; } catch { return true; }
}
function setNotifEnabled(v: boolean) {
  try { localStorage.setItem(NOTIF_KEY, String(v)); } catch {}
}

// ── Language Picker Modal ─────────────────────────────────────────────────
const LANGS: { id: Lang; nameAr: string; nameFr: string; nameEn: string; flag: string }[] = [
  { id: "ar", nameAr: "العربية", nameFr: "Arabe", nameEn: "Arabic", flag: "🇩🇿" },
  { id: "fr", nameAr: "الفرنسية", nameFr: "Français", nameEn: "French", flag: "🇫🇷" },
  { id: "en", nameAr: "الإنجليزية", nameFr: "Anglais", nameEn: "English", flag: "🇬🇧" },
];

function LangModal({ current, onClose, onSelect }: {
  current: Lang;
  onClose: () => void;
  onSelect: (l: Lang) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-card rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg">لغة التطبيق</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => { onSelect(l.id); onClose(); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                current === l.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{l.flag}</span>
                <div className="text-right">
                  <p className="font-bold">{l.nameAr}</p>
                  <p className="text-xs text-muted-foreground">{l.nameEn}</p>
                </div>
              </div>
              {current === l.id && <Check className="w-5 h-5 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Change Password Modal ─────────────────────────────────────────────────
function PasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent]     = useState("");
  const [next, setNext]           = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showCur, setShowCur]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) { setError("أدخل كلمة المرور الحالية"); return; }
    if (next.length < 8) { setError("كلمة المرور الجديدة 8 أحرف على الأقل"); return; }
    if (next !== confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    setSuccess(true);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg">تغيير كلمة المرور</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-bold text-lg">تم تغيير كلمة المرور بنجاح</p>
            <Button onClick={onClose} className="w-full mt-2">حسناً</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">كلمة المرور الحالية</label>
              <div className="relative">
                <Input
                  type={showCur ? "text" : "password"}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
                <button type="button" onClick={() => setShowCur(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">كلمة المرور الجديدة</label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  placeholder="٨ أحرف على الأقل"
                  className="pl-10"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">تأكيد كلمة المرور</label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="أعد الكتابة"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
            )}
            {next.length > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden flex gap-1">
                  {[4, 6, 8, 10].map((threshold, i) => (
                    <div key={i} className={`flex-1 rounded-full transition-colors ${
                      next.length >= threshold
                        ? i < 1 ? "bg-red-500" : i < 2 ? "bg-amber-500" : i < 3 ? "bg-yellow-500" : "bg-emerald-500"
                        : "bg-transparent"
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {next.length < 4 ? "ضعيفة جداً" : next.length < 6 ? "ضعيفة" : next.length < 8 ? "متوسطة" : next.length < 10 ? "جيدة" : "قوية"}
                </p>
              </div>
            )}
            <Button type="submit" className="w-full">حفظ كلمة المرور</Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Settings Row ──────────────────────────────────────────────────────────
function SettingsRow({
  icon: Icon, iconBg, iconColor, label, sublabel, right, onClick, danger,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; sublabel?: string; right?: React.ReactNode;
  onClick?: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 text-right transition-colors ${
        onClick ? "hover:bg-muted/50 active:bg-muted cursor-pointer" : "cursor-default"
      } ${danger ? "text-red-600 dark:text-red-400" : ""}`}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${danger ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {right ?? (onClick && !danger && <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />)}
    </button>
  );
}

function Divider() { return <div className="h-px bg-border mx-4" />; }

// ── Main ──────────────────────────────────────────────────────────────────
export default function Settings() {
  const { theme, setTheme }     = useTheme();
  const { lang, setLang, t }    = useLang();
  const { unreadCount }         = useNotifications();
  const { data: user }          = useGetMe();
  const logout                  = useLogout();
  const queryClient             = useQueryClient();
  const [, navigate]            = useLocation();

  const [showPwModal, setShowPwModal]         = useState(false);
  const [showLangModal, setShowLangModal]     = useState(false);
  const [notifEnabled, setNotifEnabledState]  = useState(getNotifEnabled);

  const toggleNotif = () => {
    setNotifEnabledState((v) => { setNotifEnabled(!v); return !v; });
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() }),
    });
  };

  const gradeLabel =
    user?.grade === "troisieme" ? t("السنة الثالثة ثانوي", "3ème Secondaire", "3rd Secondary")
    : user?.grade === "deuxieme" ? t("السنة الثانية ثانوي", "2ème Secondaire", "2nd Secondary")
    : t("السنة الأولى ثانوي", "1ère Secondaire", "1st Secondary");

  const langLabel = lang === "ar" ? "العربية 🇩🇿" : lang === "fr" ? "Français 🇫🇷" : "English 🇬🇧";

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-2xl mx-auto" dir="rtl">

      {showPwModal && <PasswordModal onClose={() => setShowPwModal(false)} />}
      {showLangModal && (
        <LangModal
          current={lang}
          onClose={() => setShowLangModal(false)}
          onSelect={setLang}
        />
      )}

      {/* Profile Hero */}
      <div className="bg-gradient-to-l from-primary to-emerald-700 rounded-2xl p-5 text-white shadow-lg flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-white/30 shrink-0">
          <AvatarImage src={user?.avatarUrl ?? ""} />
          <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
            {user?.fullName?.charAt(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-extrabold leading-tight">{user?.fullName ?? t("المستخدم", "Utilisateur", "User")}</p>
          <p className="text-white/70 text-sm mt-0.5">{gradeLabel}</p>
        </div>
      </div>

      {/* Section: الحساب */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          {t("الحساب", "Compte", "Account")}
        </p>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <SettingsRow
            icon={Lock}
            iconBg="#dbeafe"
            iconColor="#2563eb"
            label={t("تغيير كلمة المرور", "Changer le mot de passe", "Change Password")}
            sublabel={t("تحديث كلمة مرور حسابك", "Mettez à jour votre mot de passe", "Update your account password")}
            onClick={() => setShowPwModal(true)}
          />
        </div>
      </div>

      {/* Section: التفضيلات */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          {t("التفضيلات", "Préférences", "Preferences")}
        </p>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* لغة التطبيق */}
          <SettingsRow
            icon={Globe}
            iconBg="#d1fae5"
            iconColor="#059669"
            label={t("لغة التطبيق", "Langue de l'application", "App Language")}
            sublabel={langLabel}
            onClick={() => setShowLangModal(true)}
          />
          <Divider />
          {/* الوضع المظلم */}
          <SettingsRow
            icon={theme === "dark" ? Moon : Sun}
            iconBg="#fef3c7"
            iconColor="#d97706"
            label={t("الوضع المظلم", "Mode sombre", "Dark Mode")}
            sublabel={theme === "dark"
              ? t("مفعّل", "Activé", "Enabled")
              : t("معطّل", "Désactivé", "Disabled")}
            right={
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                onClick={(e) => e.stopPropagation()}
              />
            }
          />
          <Divider />
          {/* الإشعارات */}
          <SettingsRow
            icon={notifEnabled ? Bell : BellOff}
            iconBg={notifEnabled ? "#ede9fe" : "#f3f4f6"}
            iconColor={notifEnabled ? "#7c3aed" : "#9ca3af"}
            label={t("الإشعارات", "Notifications", "Notifications")}
            sublabel={notifEnabled
              ? t(`مفعّلة · ${unreadCount} غير مقروءة`, `Activées · ${unreadCount} non lues`, `Enabled · ${unreadCount} unread`)
              : t("معطّلة", "Désactivées", "Disabled")}
            right={
              <Switch
                checked={notifEnabled}
                onCheckedChange={toggleNotif}
                onClick={(e) => e.stopPropagation()}
              />
            }
          />
        </div>
      </div>

      {/* Section: الدراسة */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          {t("الدراسة", "Études", "Study")}
        </p>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <SettingsRow
            icon={GraduationCap}
            iconBg="#fce7f3"
            iconColor="#db2777"
            label={t("إعادة اختيار المستوى الدراسي", "Changer de niveau", "Change Study Level")}
            sublabel={gradeLabel}
            onClick={() => navigate("/grade-select")}
          />
        </div>
      </div>

      {/* Section: عن التطبيق */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          {t("عن التطبيق", "À propos", "About")}
        </p>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <SettingsRow
            icon={Info}
            iconBg="#e0f2fe"
            iconColor="#0284c7"
            label={t("نبذة عن التطبيق", "À propos de l'application", "About the App")}
            sublabel={t("منصة جعدي · الإصدار 1.0.0", "Mounassata Djadi · v1.0.0", "Mounassata Djadi · v1.0.0")}
            onClick={() => navigate("/about")}
          />
          <Divider />
          <SettingsRow
            icon={Shield}
            iconBg="#e7f0fd"
            iconColor="#1877f2"
            label={t("سياسة الخصوصية", "Politique de confidentialité", "Privacy Policy")}
            onClick={() => navigate("/privacy-policy")}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="bg-card rounded-2xl border border-red-200 dark:border-red-900/40 overflow-hidden shadow-sm">
        <SettingsRow
          icon={LogOut}
          iconBg="#fee2e2"
          iconColor="#dc2626"
          label={t("تسجيل الخروج", "Se déconnecter", "Sign Out")}
          danger
          onClick={handleLogout}
        />
      </div>

      <p className="text-center text-xs text-muted-foreground pb-2">
        © {new Date().getFullYear()} {t("منصة جعدي", "Mounassata Djadi", "Mounassata Djadi")}
      </p>
    </div>
  );
}
