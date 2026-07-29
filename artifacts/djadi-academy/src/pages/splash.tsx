import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetMe } from "@workspace/api-client-react";

import logoUrl from "@assets/IMG_0796_1785328682791.png";

export default function Splash() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          if (!user.grade) {
            setLocation("/grade-select");
          } else {
            setLocation("/dashboard");
          }
        } else {
          setLocation("/login");
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, isLoading, setLocation]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-[#E8F6F3] to-white dark:from-[#0B2B22] dark:to-[#0F172A] relative overflow-hidden">
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-accent/30 w-32 h-32 -m-4"
          />
          <img 
            src={logoUrl} 
            alt="Djadi Academy Logo" 
            className="w-24 h-24 object-contain drop-shadow-2xl"
          />
        </div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-primary mb-2 text-center"
        >
          أكاديمية جادي
        </motion.h1>
        
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg md:text-xl font-medium tracking-[0.2em] text-accent font-sans"
        >
          DJADI ACADEMY
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12 flex space-x-2 space-x-reverse"
          dir="rtl"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </motion.div>
      </motion.div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
    </div>
  );
}
