import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Play, BookOpen, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

// ── Types (shape returned by GET /api/review-channels) ───────────────────
interface ChannelVideo {
  id: number;
  title: string;
  titleAr: string;
  videoUrl: string;
  sortOrder: number;
}

interface Channel {
  id: number;
  channelName: string;
  teacherName: string;
  subjectId: number | null;
  subjectName: string | null;
  subjectColor: string | null;
  imageUrl: string | null;
  videos: ChannelVideo[];
}

// ── Data: single source of truth — same DB the admin panel writes to ─────
function useReviewChannels() {
  return useQuery({
    queryKey: ["review-channels"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/review-channels`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load review channels");
      return res.json() as Promise<Channel[]>;
    },
    staleTime: 30 * 1000,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────
function channelColor(ch: Channel): string {
  return ch.subjectColor || "#6366f1";
}

function channelInitials(ch: Channel): string {
  const parts = ch.teacherName.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p.charAt(0)).join("");
}

/** Extract a YouTube video id from common URL shapes; null if not YouTube. */
function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

// ── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ ch }: { ch: Channel }) {
  const color = channelColor(ch);
  if (ch.imageUrl) {
    return (
      <img
        src={ch.imageUrl}
        alt={ch.channelName}
        className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm"
      />
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-extrabold shrink-0 shadow-sm"
      style={{ backgroundColor: color + "20", color }}
    >
      {channelInitials(ch)}
    </div>
  );
}

// ── Embedded Player ───────────────────────────────────────────────────────
function VideoPlayer({ video, onClose }: { video: ChannelVideo; onClose: () => void }) {
  const ytId = youtubeId(video.videoUrl);
  const src = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
    : video.videoUrl;

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
        <p className="text-white font-bold text-sm text-right truncate max-w-[60vw]">{video.titleAr || video.title}</p>
      </div>

      {/* Player */}
      <div className="flex-1 flex items-center justify-center p-2">
        <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl">
          <iframe
            src={src}
            title={video.titleAr || video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Video info */}
      <div className="p-4 shrink-0 text-right" dir="rtl">
        <p className="text-white font-bold text-lg">{video.titleAr || video.title}</p>
      </div>
    </motion.div>
  );
}

// ── Channel Detail ────────────────────────────────────────────────────────
function ChannelDetail({ channel, onBack }: { channel: Channel; onBack: () => void }) {
  const [playingVideo, setPlayingVideo] = useState<ChannelVideo | null>(null);
  const color = channelColor(channel);

  return (
    <div className="space-y-5 animate-in fade-in duration-300" dir="rtl">
      <AnimatePresence>
        {playingVideo && (
          <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />
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
          <h1 className="text-xl font-extrabold leading-tight">{channel.channelName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{channel.teacherName}</p>
          {channel.subjectName && (
            <div className="flex items-center gap-3 mt-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: color + "20", color }}
              >
                {channel.subjectName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Videos */}
      <div>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          الدروس ({channel.videos.length})
        </h2>

        {channel.videos.length === 0 ? (
          <div className="bg-card p-10 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
            لا توجد فيديوهات في هذه القناة بعد
          </div>
        ) : (
          <div className="space-y-2">
            {channel.videos.map((video, i) => (
              <motion.button
                key={video.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setPlayingVideo(video)}
                className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all group text-right"
              >
                {/* Number + Play */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={{ backgroundColor: color + "20" }}
                >
                  <span className="text-sm font-extrabold group-hover:hidden" style={{ color }}>
                    {i + 1}
                  </span>
                  <Play className="w-4 h-4 hidden group-hover:block" style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
                    {video.titleAr || video.title}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ReviewChannels() {
  const { data: channels, isLoading, isError } = useReviewChannels();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedChannel = channels?.find((c) => c.id === selectedId) ?? null;

  if (selectedChannel) {
    return <ChannelDetail channel={selectedChannel} onBack={() => setSelectedId(null)} />;
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
            {channels
              ? `${channels.length} قناة · ${channels.reduce((s, c) => s + c.videos.length, 0)} درس`
              : "..."}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-card p-10 text-center rounded-2xl border-2 border-dashed border-border/50 text-destructive">
          تعذر تحميل قنوات المراجعة. أعد المحاولة لاحقاً.
        </div>
      )}

      {/* Empty */}
      {channels && channels.length === 0 && (
        <div className="bg-card p-12 text-center rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground">
          لا توجد قنوات مراجعة بعد
        </div>
      )}

      {/* Channel Grid */}
      {channels && channels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.map((ch, i) => {
            const color = channelColor(ch);
            return (
              <motion.button
                key={ch.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelectedId(ch.id)}
                className="bg-card border border-border rounded-2xl p-4 text-right hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col gap-3"
              >
                {/* Top: avatar + meta */}
                <div className="flex items-center gap-2.5">
                  <Avatar ch={ch} />
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm leading-tight group-hover:text-primary transition-colors">
                      {ch.channelName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{ch.teacherName}</p>
                  </div>
                </div>

                {/* Subject badge + video count */}
                <div className="flex items-center justify-between">
                  {ch.subjectName ? (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: color + "20", color }}
                    >
                      {ch.subjectName}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="w-3 h-3" />
                    {ch.videos.length} دروس
                  </span>
                </div>

                {/* Video previews */}
                {ch.videos.length > 0 && (
                  <div className="space-y-1 border-t border-border pt-2.5">
                    {ch.videos.slice(0, 2).map((v, vi) => (
                      <div key={v.id} className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center shrink-0"
                          style={{ backgroundColor: color + "20", color }}
                        >
                          {vi + 1}
                        </span>
                        <p className="text-xs text-muted-foreground truncate flex-1">{v.titleAr || v.title}</p>
                      </div>
                    ))}
                    {ch.videos.length > 2 && (
                      <p className="text-[10px] text-primary font-semibold pt-0.5">
                        + {ch.videos.length - 2} دروس أخرى
                      </p>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
