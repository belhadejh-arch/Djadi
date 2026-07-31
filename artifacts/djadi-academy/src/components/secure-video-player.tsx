/**
 * Hardened in-app video player.
 *
 * - YouTube URLs are embedded via youtube-nocookie.com with the most
 *   contained parameter set (modestbranding, rel=0, playsinline, fs=0,
 *   iv_load_policy=3) so nothing leads out of the app.
 * - Click-shield overlays block the clickable YouTube title (top) and the
 *   "watch on YouTube" logo (bottom-right control bar) that would otherwise
 *   open youtube.com in a new tab/app.
 * - Direct video files (.mp4/.webm/.ogg) use a <video> element with
 *   download/remote-playback/PiP disabled.
 * - Right-click and text selection are disabled inside the player.
 */

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

/** Extract a YouTube video id from common URL shapes; null if not YouTube. */
export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

interface SecureVideoPlayerProps {
  url: string;
  title: string;
  autoplay?: boolean;
  className?: string;
}

export function SecureVideoPlayer({ url, title, autoplay = false, className = "" }: SecureVideoPlayerProps) {
  const ytId = youtubeId(url);
  // Non-YouTube videos arrive as internal protected proxy paths (/api/files/...)
  const isInternalPath = url.startsWith("/api/");
  const isDirectVideo = isInternalPath || /\.(mp4|webm|ogg)(\?|$)/i.test(url);

  const block = (e: React.SyntheticEvent) => e.preventDefault();

  if (!ytId && isDirectVideo) {
    return (
      <div
        className={`relative bg-black select-none ${className}`}
        onContextMenu={block}
      >
        <video
          src={isInternalPath ? `${BASE_URL}${url}` : url}
          controls
          autoPlay={autoplay}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          playsInline
          className="w-full h-full"
          onContextMenu={block}
        />
      </div>
    );
  }

  const src = ytId
    ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&fs=0&iv_load_policy=3&disablekb=0&controls=1`
    : url;

  return (
    <div
      className={`relative bg-black select-none ${className}`}
      onContextMenu={block}
    >
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        className="w-full h-full border-0"
      />
      {ytId && (
        <>
          {/* Shield: clickable video title / share row at the top */}
          <div
            className="absolute top-0 left-0 right-0 h-14 z-10"
            onContextMenu={block}
            aria-hidden="true"
          />
          {/* Shield: "Watch on YouTube" logo in the bottom-right control bar */}
          <div
            className="absolute bottom-0 right-0 w-24 h-10 z-10"
            onContextMenu={block}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}
