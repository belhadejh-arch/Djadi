import { motion } from "framer-motion";
import { Youtube, ExternalLink, BookOpen } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description: string;
  subject: string;
  url: string;
  color: string;
}

const CHANNELS: Channel[] = [
  {
    id: "1",
    name: "قناة الأستاذ المراجع",
    description: "دروس شاملة في الرياضيات للبكالوريا",
    subject: "الرياضيات",
    url: "https://www.youtube.com",
    color: "#2563eb",
  },
  {
    id: "2",
    name: "فيزياء وكيمياء BAC",
    description: "ملخصات وحل تمارين الفيزياء والكيمياء",
    subject: "الفيزياء والكيمياء",
    url: "https://www.youtube.com",
    color: "#7c3aed",
  },
  {
    id: "3",
    name: "علوم الطبيعة والحياة",
    description: "دروس وملخصات علوم الطبيعة والحياة",
    subject: "علوم الطبيعة والحياة",
    url: "https://www.youtube.com",
    color: "#059669",
  },
  {
    id: "4",
    name: "اللغة العربية وآدابها",
    description: "قواعد اللغة والنصوص الأدبية",
    subject: "اللغة العربية",
    url: "https://www.youtube.com",
    color: "#16a34a",
  },
  {
    id: "5",
    name: "Français BAC",
    description: "Cours et exercices de langue française",
    subject: "اللغة الفرنسية",
    url: "https://www.youtube.com",
    color: "#4f46e5",
  },
  {
    id: "6",
    name: "التاريخ والجغرافيا",
    description: "ملخصات وخرائط تاريخية وجغرافية",
    subject: "التاريخ والجغرافيا",
    url: "https://www.youtube.com",
    color: "#b45309",
  },
];

export default function ReviewChannels() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Youtube className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">قنوات المراجعة</h1>
            <p className="text-white/80 mt-1">أفضل قنوات المراجعة على يوتيوب للثانوية الجزائرية</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHANNELS.map((channel, i) => (
          <motion.a
            key={channel.id}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all group block"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: channel.color + "20" }}
              >
                <Youtube className="w-6 h-6" style={{ color: channel.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                    {channel.name}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-1 mb-2">
                  <BookOpen className="w-3 h-3 text-muted-foreground" />
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: channel.color + "20",
                      color: channel.color,
                    }}
                  >
                    {channel.subject}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {channel.description}
                </p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
