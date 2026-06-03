import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
}

export const VideoPlayer = ({
  src,
  poster,
  title = "Video",
  className,
  autoPlay = false,
  muted = false,
  loop = true,
  playsInline = true,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const hasVideo = !!src;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        hasVideo ? "aspect-video" : "aspect-video",
        "video-container",
        className
      )}
      style={{
        aspectRatio: '16/9',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {!hasVideo ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Play className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground/60 font-heading text-lg">
            {title}
          </p>
          <p className="text-muted-foreground/40 text-sm mt-2">
            Video coming soon
          </p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={poster}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            playsInline={playsInline}
          >
            <source src={src} type="video/mp4" />
          </video>

          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute top-4 left-4">
              <span className="text-white font-heading text-lg tracking-wider">
                {title}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div
                className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4 group/progress"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-accent rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
<Button
                     variant="ghost"
                     size="icon"
                     onClick={togglePlay}
                     className="text-white hover:text-white hover:bg-white/20"
                     aria-label={isPlaying ? "Pause video" : "Play video"}
                   >
                     {isPlaying ? (
                       <Pause className="w-5 h-5" />
                     ) : (
                       <Play className="w-5 h-5 ml-0.5" />
                     )}
                   </Button>

                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={toggleMute}
                     className="text-white hover:text-white hover:bg-white/20"
                     aria-label={isMuted ? "Unmute" : "Mute"}
                   >
                     {isMuted ? (
                       <VolumeX className="w-5 h-5" />
                     ) : (
                       <Volume2 className="w-5 h-5" />
                     )}
                   </Button>
                </div>

<Button
                   variant="ghost"
                   size="icon"
                   onClick={toggleFullscreen}
                   className="text-white hover:text-white hover:bg-white/20"
                   aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                 >
                   {isFullscreen ? (
                     <Minimize className="w-5 h-5" />
                   ) : (
                     <Maximize className="w-5 h-5" />
                   )}
                 </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {!hasVideo && !src && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {isPlaying && (
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center animate-pulse">
              <Play className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface HeroVideoProps {
  videoSrc?: string;
  posterSrc?: string;
}

export const HeroVideo = ({ videoSrc, posterSrc }: HeroVideoProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <VideoPlayer
        src={videoSrc}
        poster={posterSrc}
        autoPlay
        muted
        loop
        className="w-full h-full"
      />
      <div className="absolute inset-0 bg-primary/70" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-heading text-6xl sm:text-8xl lg:text-9xl text-primary-foreground/10 tracking-wider">
          TTIN
        </span>
      </div>
    </div>
  );
};

export default VideoPlayer;