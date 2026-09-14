import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.info("404 route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background vignette">
      <EmberGlow intensity="high" />
      <div className="relative z-10 px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="kicker mb-6"
        >
          Lost In The Dark
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4 font-heading text-[8rem] leading-none tracking-wider text-gradient-gold sm:text-[12rem]"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mb-2 max-w-md font-display text-2xl italic text-foreground/90"
        >
          This path went dark.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10 font-body text-muted-foreground"
        >
          <span className="text-accent">{location.pathname}</span> doesn't exist — yet.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-heading text-lg tracking-[0.15em] text-accent-foreground transition-all duration-300 hover:glow-accent"
          >
            <Home size={18} /> Return To The Light
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
