import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Play, Clock, BookOpen, ArrowRight, Users } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  title: string;
  duration: string;
  youtubeId: string;
  description?: string;
}

interface Channel {
  id: string;
  name: string;
  teacher: string;
  subject: string;
  subjectColor: string;
  avatarBg: string;
  avatarInitials: string;
  subscribers: string;
  lessons: Lesson[];
}

const CHANNELS: Channel[] = [
  {
    id: "ch-math",
    name: "رياضيات البكالوريا",
    teacher: "الأستاذ كمال بن علي",
    subject: "الرياضيات",
    subjectColor: "#2563eb",
    avatarBg: "#dbeafe",
    avatarInitials: "كب",
    subscribers: "٨٥٠٠٠",
    lessons: [
      { id: "l1", title: "الدوال العددية — المفهوم والخصائص", duration: "٤٥ د", youtubeId: "dQw4w9WgXcQ", description: "مدخل إلى الدوال العددية وأنواعها" },
      { id: "l2", title: "الاشتقاق — التعريف والقواعد الأساسية", duration: "٥٠ د", youtubeId: "dQw4w9WgXcQ", description: "قواعد الاشتقاق مع تطبيقات متنوعة" },
      { id: "l3", title: "التكامل — النهج والتطبيقات", duration: "٥٥ د", youtubeId: "dQw4w9WgXcQ", description: "التكامل المحدود وغير المحدود" },
      { id: "l4", title: "المتتاليات — الحسابية والهندسية", duration: "٤٠ د", youtubeId: "dQw4w9WgXcQ", description: "تعريف المتتاليات وحساب مجاميعها" },
      { id: "l5", title: "الاحتمالات — القانون والتطبيق", duration: "٣٥ د", youtubeId: "dQw4w9WgXcQ", description: "حساب الاحتمالات البسيطة والمركبة" },
    ],
  },
  {
    id: "ch-physics",
    name: "فيزياء وكيمياء BAC",
    teacher: "الأستاذة سهيلة مرابط",
    subject: "الفيزياء والكيمياء",
    subjectColor: "#7c3aed",
    avatarBg: "#ede9fe",
    avatarInitials: "سم",
    subscribers: "٦٢٠٠٠",
    lessons: [
      { id: "l1", title: "الميكانيك — قوانين نيوتن", duration: "٤٢ د", youtubeId: "dQw4w9WgXcQ", description: "القوانين الثلاثة لنيوتن مع حل مسائل" },
      { id: "l2", title: "الكهرباء — التيار والمقاومة", duration: "٤٨ د", youtubeId: "dQw4w9WgXcQ", description: "الدوائر الكهربائية وقانون أوم" },
      { id: "l3", title: "الضوئيات — الانكسار والانعكاس", duration: "٣٨ د", youtubeId: "dQw4w9WgXcQ", description: "ظاهرتا الانعكاس والانكسار والعدسات" },
      { id: "l4", title: "الكيمياء العضوية — المركبات", duration: "٥٢ د", youtubeId: "dQw4w9WgXcQ", description: "تصنيف المركبات العضوية وخصائصها" },
    ],
  },
  {
    id: "ch-svt",
    name: "علوم الطبيعة والحياة",
    teacher: "الأستاذ عمر زروقي",
    subject: "علوم الطبيعة والحياة",
    subjectColor: "#059669",
    avatarBg: "#d1fae5",
    avatarInitials: "عز",
    subscribers: "٤٩٠٠٠",
    lessons: [
      { id: "l1", title: "الجهاز العصبي — البنية والوظيفة", duration: "٤٦ د", youtubeId: "dQw4w9WgXcQ", description: "مكونات الجهاز العصبي وآلية عمله" },
      { id: "l2", title: "الجينات والوراثة — قوانين مندل", duration: "٥٠ د", youtubeId: "dQw4w9WgXcQ", description: "قوانين الوراثة مع حل مسائل" },
      { id: "l3", title: "المناعة — دفاعات الجسم", duration: "٤٤ د", youtubeId: "dQw4w9WgXcQ", description: "الجهاز المناعي والاستجابة المناعية" },
    ],
  },
  {
    id: "ch-arabic",
    name: "اللغة العربية BAC",
    teacher: "الأستاذ فيصل بوزيد",
    subject: "اللغة العربية",
    subjectColor: "#16a34a",
    avatarBg: "#dcfce7",
    avatarInitials: "فب",
    subscribers: "٧٣٠٠٠",
    lessons: [
      { id: "l1", title: "النصوص الأدبية — التحليل والتفسير", duration: "٣٨ د", youtubeId: "dQw4w9WgXcQ", description: "منهجية تحليل النص الأدبي" },
      { id: "l2", title: "قواعد اللغة — الإعراب المفصّل", duration: "٤٢ د", youtubeId: "dQw4w9WgXcQ", description: "قواعد الإعراب وعلامات البناء" },
      { id: "l3", title: "المقال الأدبي — البناء والأسلوب", duration: "٣٥ د", youtubeId: "dQw4w9WgXcQ", description: "كيفية كتابة مقال أدبي متكامل" },
      { id: "l4", title: "الشعر الحديث — الخصائص والأعلام", duration: "٤٠ د", youtubeId: "dQw4w9WgXcQ", description: "رواد الشعر الحديث وأبرز قصائدهم" },
    ],
  },
  {
    id: "ch-philo",
    name: "الفلسفة والمنطق",
    teacher: "الأستاذة نادية قاسم",
    subject: "الفلسفة",
    subjectColor: "#db2777",
    avatarBg: "#fce7f3",
    avatarInitials: "نق",
    subscribers: "٣٨٠٠٠",
    lessons: [
      { id: "l1", title: "المقالة الفلسفية — المنهجية الكاملة", duration: "٤٥ د", youtubeId: "dQw4w9WgXcQ", description: "خطوات كتابة المقالة الفلسفية" },
      { id: "l2", title: "الوعي والإدراك — المفاهيم الكبرى", duration: "٤٢ د", youtubeId: "dQw4w9WgXcQ", description: "نظريات الوعي والإدراك الحسي" },
      { id: "l3", title: "الحرية والمسؤولية", duration: "٣٨ د", youtubeId: "dQw4w9WgXcQ", description: "إشكالية الحرية بين الفلاسفة" },
    ],
  },
  {
    id: "ch-hist",
    name: "التاريخ والجغرافيا",
    teacher: "الأستاذ رشيد حمداني",
    subject: "التاريخ والجغرافيا",
    subjectColor: "#b45309",
    avatarBg: "#fef3c7",
    avatarInitials: "رح",
    subscribers: "٤١٠٠٠",
    lessons: [
      { id: "l1", title: "الحرب الباردة — الأسباب والنتائج", duration: "٤٤ د", youtubeId: "dQw4w9WgXcQ", description: "مراحل الحرب الباردة وأبرز أحداثها" },
      { id: "l2", title: "تحرر الشعوب — النماذج والمقارنة", duration: "٤٠ د", youtubeId: "dQw4w9WgXcQ", description: "حركات التحرر في آسيا وأفريقيا" },
      { id: "l3", title: "الجغرافيا الاقتصادية — الموارد", duration: "٣٥ د", youtubeId: "dQw4w9WgXcQ", description: "توزيع الموارد الطبيعية في العالم" },
    ],
  },
];

// ── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ ch }: { ch: Channel }) {
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold shrink-0 shadow-sm"
      style={{ backgroundColor: ch.avatarBg, color: ch.subjectColor }}
    >
      {ch.avatarInitials}
    </div>
  );
}

// ── Embedded YouTube Player ───────────────────────────────────────────────
function VideoPlayer({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-semibold"
        >
          <ArrowRight className="w-5 h-5" />
          رجوع
        </button>
        <p className="text-white font-bold text-sm text-right truncate max-w-[60vw]">{lesson.title}</p>
      </div>

      {/* Player */}
      <div className="flex-1 flex items-center justify-center p-2">
        <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Lesson info */}
      <div className="p-4 shrink-0 text-right" dir="rtl">
        <p className="text-white font-bold text-lg">{lesson.title}</p>
        {lesson.description && (
          <p className="text-white/60 text-sm mt-1">{lesson.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 justify-end">
          <Clock className="w-3.5 h-3.5 text-white/50" />
          <span className="text-white/50 text-xs">{lesson.duration}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Channel Detail ────────────────────────────────────────────────────────
function ChannelDetail({
  channel,
  onBack,
}: {
  channel: Channel;
  onBack: () => void;
}) {
  const [playingLesson, setPlayingLesson] = useState<Lesson | null>(null);

  return (
    <div className="space-y-5 animate-in fade-in duration-300" dir="rtl">
      <AnimatePresence>
        {playingLesson && (
          <VideoPlayer lesson={playingLesson} onClose={() => setPlayingLesson(null)} />
        )}
      </AnimatePresence>

      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm"
      >
        <ChevronRight className="w-4 h-4" />
        جميع القنوات
      </button>

      {/* Channel Header */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm">
        <Avatar ch={channel} />
        <div className="flex-1">
          <h1 className="text-xl font-extrabold leading-tight">{channel.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{channel.teacher}</p>
          <div className="flex items-center gap-3 mt-2">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: channel.subjectColor + "20", color: channel.subjectColor }}
            >
              {channel.subject}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {channel.subscribers} مشترك
            </span>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          الدروس ({channel.lessons.length})
        </h2>

        <div className="space-y-2">
          {channel.lessons.map((lesson, i) => (
            <motion.button
              key={lesson.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setPlayingLesson(lesson)}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all group text-right"
            >
              {/* Number + Play */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-opacity-100"
                style={{ backgroundColor: channel.subjectColor + "20" }}
              >
                <span
                  className="text-sm font-extrabold group-hover:hidden"
                  style={{ color: channel.subjectColor }}
                >
                  {i + 1}
                </span>
                <Play
                  className="w-4 h-4 hidden group-hover:block"
                  style={{ color: channel.subjectColor }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
                  {lesson.title}
                </p>
                {lesson.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {lesson.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="w-3 h-3" />
                {lesson.duration}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ReviewChannels() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  if (selectedChannel) {
    return (
      <ChannelDetail
        channel={selectedChannel}
        onBack={() => setSelectedChannel(null)}
      />
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-red-600 to-rose-500 rounded-2xl p-5 text-white shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Play className="w-6 h-6 fill-white text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">قنوات المراجعة</h1>
          <p className="text-white/70 text-sm mt-0.5">
            {CHANNELS.length} قناة · {CHANNELS.reduce((s, c) => s + c.lessons.length, 0)} درس
          </p>
        </div>
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CHANNELS.map((ch, i) => (
          <motion.button
            key={ch.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setSelectedChannel(ch)}
            className="bg-card border border-border rounded-2xl p-5 text-right hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col gap-4"
          >
            {/* Top: avatar + meta */}
            <div className="flex items-center gap-3">
              <Avatar ch={ch} />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-base leading-tight group-hover:text-primary transition-colors">
                  {ch.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{ch.teacher}</p>
              </div>
            </div>

            {/* Subject badge + lesson count */}
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: ch.subjectColor + "20", color: ch.subjectColor }}
              >
                {ch.subject}
              </span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {ch.lessons.length} دروس
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {ch.subscribers}
                </span>
              </div>
            </div>

            {/* Lesson previews */}
            <div className="space-y-1.5 border-t border-border pt-3">
              {ch.lessons.slice(0, 2).map((l, li) => (
                <div key={l.id} className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: ch.subjectColor + "20", color: ch.subjectColor }}
                  >
                    {li + 1}
                  </span>
                  <p className="text-xs text-muted-foreground truncate flex-1">{l.title}</p>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">{l.duration}</span>
                </div>
              ))}
              {ch.lessons.length > 2 && (
                <p className="text-[10px] text-primary font-semibold pt-0.5">
                  + {ch.lessons.length - 2} دروس أخرى
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
