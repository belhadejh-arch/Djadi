import { Link } from "wouter";
import { ChevronRight, FileText } from "lucide-react";

const SECTIONS = [
  {
    title: "القبول بالشروط",
    content:
      "باستخدامك لتطبيق منصة جعدي، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام التطبيق.",
  },
  {
    title: "وصف الخدمة",
    content:
      "منصة جعدي منصة تعليمية مستقلة توفر محتوى مراجعة للتلاميذ الجزائريين في المرحلة الثانوية. التطبيق ليس تابعاً لوزارة التربية الوطنية أو أي جهة حكومية.",
  },
  {
    title: "شروط الاستخدام",
    items: [
      "يجب أن يكون المستخدم طالباً في المرحلة الثانوية أو ولياً لأمر طالب.",
      "يُحظر استخدام التطبيق لأغراض غير تعليمية.",
      "يُمنع مشاركة بيانات الحساب مع الغير.",
      "يُحظر نسخ المحتوى أو توزيعه دون إذن مسبق.",
    ],
  },
  {
    title: "إخلاء المسؤولية",
    items: [
      "المحتوى التعليمي مقدَّم للمساعدة في المراجعة فقط ولا يُعدّ مصدراً رسمياً.",
      "لا تتحمل منصة جعدي مسؤولية نتائج الامتحانات.",
      "قد يتغير المحتوى دون إشعار مسبق.",
    ],
  },
  {
    title: "الملكية الفكرية",
    content:
      "جميع المحتويات المنشورة على التطبيق محمية بحقوق الملكية الفكرية. يُمنع إعادة نشر أي محتوى أو استخدامه تجارياً دون إذن خطي مسبق.",
  },
  {
    title: "التعديلات على الشروط",
    content:
      "نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إعلامك بأي تغييرات جوهرية عبر الإشعارات داخل التطبيق.",
  },
];

export default function Terms() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto" dir="rtl">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/settings" className="hover:text-primary transition-colors">الإعدادات</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">شروط الاستخدام</span>
      </nav>

      <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl p-6 text-white flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">شروط الاستخدام</h1>
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
