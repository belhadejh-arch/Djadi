import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMe } from "@workspace/api-client-react";
import logoUrl from "@assets/IMG_0796_1785328682791.png";
// @ts-ignore – video asset import
import loadingVideoUrl from "@assets/‎⁨رحلة_عبر_السحاب_(تأثير_الفيديو_بالذكاء_الاصطناعي)_20260729__1785333259594.mp4";

const MIN_DISPLAY_MS = 3000; // show for at least 3 s

export default function Splash() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Navigate away once auth resolves and minimum display time has passed
  useEffect(() => {
    const start = Date.now();

    const go = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          if (user) {
            if (!user.grade) {
              setLocation("/grade-select");
            } else {
              setLocation("/dashboard");
            }
          } else {
            setLocation("/login");
          }
        }, 600); // fade-out duration
      }, wait);
    };

    if (!isLoading) go();
  }, [isLoading, user, setLocation]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 overflow-hidden bg-black flex items-center justify-center"
        >
          {/* ── Fullscreen video ── */}
          <video
            ref={videoRef}
            src={loadingVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Dark gradient overlay so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none" />

          {/* ── Logo + title overlay ── */}
          <div className="relative z-10 flex flex-col items-center select-none" dir="rtl">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-5"
            >
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border-2 border-dashed border-white/30"
              />
              <img
                src={logoUrl}
                alt="Djadi Academy"
                className="w-24 h-24 object-contain drop-shadow-2xl"
              />
            </motion.div>

            <motion.h1
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-1 text-center"
            >
              أكاديمية جادي
            </motion.h1>

            <motion.p
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="text-sm md:text-base font-semibold tracking-[0.25em] text-white/70 font-sans uppercase"
            >
              Djadi Academy
            </motion.p>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-10 flex gap-2"
            >
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full bg-white/80 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
