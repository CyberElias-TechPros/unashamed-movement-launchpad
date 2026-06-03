import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
}

interface PodcastPlayerProps {
  episodes: Episode[];
  className?: string;
}

export const PodcastPlayer = ({ episodes, className }: PodcastPlayerProps) => {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(episodes[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!currentEpisode) return;
    const currentIndex = episodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex < episodes.length - 1) {
      setCurrentEpisode(episodes[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!currentEpisode) return;
    const currentIndex = episodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex > 0) {
      setCurrentEpisode(episodes[currentIndex - 1]);
    }
  };

  return (
    <div className={className}>
      <AnimatePresence>
        {currentEpisode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-card rounded-2xl p-6 border border-border"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading tracking-wider">{currentEpisode.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {currentEpisode.description}
                </p>
              </div>
<Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                 aria-label="Toggle playlist"
               >
                 <List size={18} />
               </Button>
            </div>

<div className="flex items-center justify-center gap-4 mb-4">
               <Button variant="ghost" size="sm" onClick={handlePrevious} aria-label="Previous episode">
                 <SkipBack size={18} />
               </Button>
               <Button
                 variant="hero"
                 size="lg"
                 onClick={handlePlayPause}
                 className="w-14 h-14 rounded-full"
                 aria-label={isPlaying ? "Pause" : "Play"}
               >
                 {isPlaying ? (
                   <Pause className="w-6 h-6" />
                 ) : (
                   <Play className="w-6 h-6 ml-1" />
                 )}
               </Button>
               <Button variant="ghost" size="sm" onClick={handleNext} aria-label="Next episode">
                 <SkipForward size={18} />
               </Button>
             </div>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  style={{ width: "65%" }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {currentEpisode.duration}
              </span>
            </div>

            <AnimatePresence>
              {isPlaylistOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <h4 className="font-heading text-sm tracking-wider mb-3">Episodes</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {episodes.map((episode, index) => (
                      <button
                        key={episode.id}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentEpisode.id === episode.id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setCurrentEpisode(episode)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-6">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-body text-sm">{episode.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {episode.duration}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};