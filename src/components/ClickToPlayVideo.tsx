import { useRef, useState, useEffect } from "react";
import { Play } from "lucide-react";

/* Drive URL builders (ported from ClickToPlayVideo-BiqB_NX5.js) */
export const getDriveVideoUrl = (id: string) =>
  `https://drive.google.com/uc?export=download&id=${id}`;

export const getDriveThumbnailUrl = (id: string) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w400`;

interface ClickToPlayVideoProps {
  src: string;
  thumbnailUrl?: string;
  className?: string;
  aspectRatio?: string;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
}

/**
 * Prototype video card: shows a thumbnail with a gold play button,
 * swaps to a playing <video> on click. When muted+loop (background mode),
 * it autoplays whenever scrolled into view.
 */
const ClickToPlayVideo = ({
  src,
  thumbnailUrl,
  className = "",
  aspectRatio = "aspect-video",
  muted = true,
  controls = false,
  loop = false,
}: ClickToPlayVideoProps) => {
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView) {
      startedRef.current = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView]);

  if (!startedRef.current && !playing) {
    return (
      <div
        ref={ref}
        className={`relative ${aspectRatio} bg-[#0a0a0a] overflow-hidden cursor-pointer group ${className}`}
        onClick={() => {
          startedRef.current = true;
          setPlaying(true);
        }}
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#eab308]/20 flex items-center justify-center group-hover:bg-[#eab308]/40 transition-all duration-300 scale-90 group-hover:scale-100">
            <Play size={24} className="text-[#eab308] ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${aspectRatio} bg-black ${className}`}>
      <video
        ref={videoRef}
        muted={muted}
        controls={controls}
        loop={loop}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={src}
      />
    </div>
  );
};

export default ClickToPlayVideo;
