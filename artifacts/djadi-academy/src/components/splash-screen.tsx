import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const SPLASH_KEY = 'djadi_splash_shown';
const DURATION_MS = 4000;

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const skip = () => {
    sessionStorage.setItem(SPLASH_KEY, '1');
    setVisible(false);
    onDone();
  };

  useEffect(() => {
    // Progress bar animation
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / DURATION_MS) * 100, 100));
      if (elapsed < DURATION_MS) {
        requestAnimationFrame(tick);
      }
    };
    const raf = requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, '1');
      setVisible(false);
      onDone();
    }, DURATION_MS);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex flex-col"
    >
      {/* Full-screen splash image */}
      <img
        src="/splash.png"
        alt="Djadi Academy"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        draggable={false}
      />

      {/* Bottom overlay: progress bar + skip button */}
      <div
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        className="flex flex-col items-center gap-4 pb-10 px-8"
      >
        {/* Progress bar */}
        <div className="w-full max-w-xs h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.3)' }}>
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${progress}%`,
              background: 'rgba(255,255,255,0.9)',
            }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={skip}
          className="px-8 py-3 rounded-full text-sm font-semibold"
          style={{
            background: 'rgba(255,255,255,0.18)',
            color: '#ffffff',
            border: '1.5px solid rgba(255,255,255,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            letterSpacing: '0.03em',
          }}
        >
          تخطي
        </button>
      </div>
    </div>
  );
}

/** Returns true if the splash has NOT been shown yet this session */
export function shouldShowSplash(): boolean {
  return !sessionStorage.getItem(SPLASH_KEY);
}
