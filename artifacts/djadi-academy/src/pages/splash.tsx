import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMe } from "@workspace/api-client-react";

const loadingVideoUrl = `${import.meta.env.BASE_URL}loading-video.mp4`;

const FALLBACK_TIMEOUT_MS = 8000; // navigate even if video never fires onEnded

export default function Splash() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [exiting, setExiting] = useState(false);
  const navigatedRef = useRef(false);

  const navigate = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    setExiting(true);
    setTimeout(() => {
      if (user) {
        setLocation(user.grade ? "/dashboard" : "/grade-select");
      } else {
        setLocation("/login");
      }
    }, 600); // matches exit transition duration
  };

  // Navigate when video ends (primary trigger)
  const handleVideoEnd = () => {
    if (!isLoading) navigate();
    else {
      // Auth still in-flight — wait for it, then go
      const check = setInterval(() => {
        if (!isLoading) {
          clearInterval(check);
          navigate();
        }
      }, 100);
    }
  };

  // Fallback: navigate after FALLBACK_TIMEOUT_MS regardless
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) navigate();
    }, FALLBACK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If auth resolved AND video already ended (edge case), navigate immediately
  useEffect(() => {
    if (!isLoading && navigatedRef.current === false) {
      const video = videoRef.current;
      if (video && video.ended) navigate();
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-black overflow-hidden"
        >
          <video
            ref={videoRef}
            src={loadingVideoUrl}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
