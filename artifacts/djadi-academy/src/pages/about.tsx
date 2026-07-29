import { Link } from "wouter";
import { ChevronRight, Info, Facebook, Youtube, Send, Instagram } from "lucide-react";
import logoUrl from "@assets/IMG_0796_1785328682791.png";

// Social links — admin-managed via localStorage
const SOCIAL_STORAGE_KEY = "djadi_social_links";

interface SocialLinks {
  facebook: string;
  youtube: string;
  telegram: string;
  instagram: string;
}

function getSocialLinks(): SocialLinks {
  try {
    const raw = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SocialLinks;
  } catch {}
  return { facebook: "", youtube: "", telegram: "", instagram: "" };
}

const SOCIALS: {
  key: keyof SocialLinks;
  label: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { key: "facebook", label: "Facebook", Icon: Facebook, color: "#1877f2", bg: "#e7f0fd" },
  { key: "youtube",  label: "YouTube",  Icon: Youtube,  color: "#ff0000", bg: "#fdecea" },
  { key: "telegram", label: "Telegram", Icon: Send,     color: "#0088cc", bg: "#e4f3fb" },
  { key: "instagram",label: "Instagram",Icon: Instagram,color: "#e1306c", bg: "#fce8f0" },
];

const BULLET_POINTS = [
  "ليس تابعاً لأي جهة حكومية أو وزارة التربية الوطنية الجزائرية.",
  "لا يمثل أي هيئة رسمية ولا يقدّم معلومات صادرة مباشرة عن الحكومة.",
  "يعتمد على المناهج التعليمية المتاحة للجمهور والكتب المدرسية المقررة لمساعدة التلاميذ في مراجعتهم الخاصة.",
  "الهدف هو توفير دعم تعليمي إضافي وشامل لمساعدة التلاميذ على التحضير الجيد للبكالوريا.",
];

export default function About() {
  const social = getSocialLinks();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/settings" className="hover:text-primary transition-colors">الإعدادات</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">نبذة عن التطبيق</span>
      </nav>

      {/* App identity */}
      <div className="bg-gradient-to-br from-primary to-emerald-700 rounded-3xl p-8 text-white text-center shadow-lg">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <img src={logoUrl} alt="Djadi Academy" className="w-14 h-14 object-contain" />
        </div>
        <h1 className="text-2xl font-extrabold">أكاديمية جادي</h1>
        <p className="text-white/70 text-sm mt-1" dir="ltr">Djadi Academy</p>
        <span className="inline-block mt-3 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
          الإصدار 1.0.0
        </span>
      </div>

      {/* Description */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-5 h-5 text-primary" />
          <h2 className="font-extrabold text-lg">عن التطبيق</h2>
        </div>
        <p className="text-foreground leading-relaxed text-sm">
          منصة تعليمية مستقلة لمساعدة تلاميذ الثانوي في مراجعة دروسهم والتحضير لاختبار البكالوريا (BAC).
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-4">
          <p className="text-amber-800 dark:text-amber-300 font-bold text-sm mb-3">
            نودّ التأكيد على أن هذا التطبيق:
          </p>
          <ul className="space-y-2.5">
            {BULLET_POINTS.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-amber-900 dark:text-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-base">تابعنا على</h2>
        <div className="grid grid-cols-2 gap-3">
          {SOCIALS.map(({ key, label, Icon, color, bg }) => {
            const url = social[key];
            const Tag = url ? "a" : "div";
            return (
              <Tag
                key={key}
                {...(url ? { href: url, target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`flex items-center gap-3 rounded-xl p-3.5 border transition-all ${
                  url
                    ? "border-border hover:shadow-md hover:scale-[1.02] cursor-pointer"
                    : "border-border/40 opacity-50 cursor-default"
                }`}
                style={{ backgroundColor: bg }}
              >
                <Icon className="w-6 h-6 shrink-0" style={{ color }} />
                <div>
                  <p className="font-bold text-sm" style={{ color }}>{label}</p>
                  {!url && (
                    <p className="text-[10px] text-muted-foreground">غير متاح</p>
                  )}
                </div>
              </Tag>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        © {new Date().getFullYear()} أكاديمية جادي — جميع الحقوق محفوظة
      </p>
    </div>
  );
}
