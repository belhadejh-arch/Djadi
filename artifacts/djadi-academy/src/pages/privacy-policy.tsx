import { Link } from "wouter";
import { ChevronRight, Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "المقدمة",
    content:
      "تلتزم أكاديمية جادي بحماية خصوصية مستخدميها. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها عند استخدامك للتطبيق.",
  },
  {
    title: "المعلومات التي نجمعها",
    items: [
      "معلومات الحساب: الاسم الكامل، البريد الإلكتروني، كلمة المرور (مشفّرة).",
      "معلومات دراسية: المستوى الدراسي، الشعبة.",
      "بيانات الاستخدام: الدروس المشاهَدة، النتائج المحسوبة (محلياً فقط).",
    ],
  },
  {
    title: "كيف نستخدم معلوماتك",
    items: [
      "توفير الخدمات التعليمية وتخصيص المحتوى حسب مستواك الدراسي.",
      "تحسين تجربة استخدام التطبيق.",
      "إرسال إشعارات تعليمية ذات صلة بمستواك.",
    ],
  },
  {
    title: "حماية البيانات",
    content:
      "نستخدم تشفير SSL/TLS لحماية بياناتك أثناء النقل. كلمات المرور مشفّرة ولا يمكن لأحد الاطلاع عليها. لا نبيع بياناتك لأطراف ثالثة.",
  },
  {
    title: "حقوقك",
    items: [
      "الحق في الوصول إلى بياناتك الشخصية.",
      "الحق في تصحيح أي معلومات غير دقيقة.",
      "الحق في حذف حسابك وجميع بياناتك.",
    ],
  },
  {
    title: "تواصل معنا",
    content:
      "إذا كانت لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر القنوات الرسمية للتطبيق.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto" dir="rtl">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/settings" className="hover:text-primary transition-colors">الإعدادات</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">سياسة الخصوصية</span>
      </nav>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">سياسة الخصوصية</h1>
          <p className="text-white/70 text-xs mt-0.5">آخر تحديث: يوليو 2026</p>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <div key={s.title} className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
            <h2 className="font-extrabold text-base text-primary">{s.title}</h2>
            {s.content && <p className="text-sm text-foreground leading-relaxed">{s.content}</p>}
            {s.items && (
              <ul className="space-y-2">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
