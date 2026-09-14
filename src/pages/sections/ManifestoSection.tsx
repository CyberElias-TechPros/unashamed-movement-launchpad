import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import EmberGlow from "@/components/cinematic/EmberGlow";

const WORDS =
  "Silence never saved anyone. Timidity never shook a city. The Gospel was never meant to be whispered — it was meant to be shouted from the rooftops.".split(" ");

const Word = ({ word, index, total, progress }: { word: string; index: number; total: number; progress: MotionValue<number> }) => {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const y = useTransform(progress, [start, end], [12, 0]);
  const highlight = ["shouted", "rooftops.", "whispered"].includes(word);
  return (
    <motion.span
      style={{ opacity, y }}
      className={`inline-block will-change-transform ${highlight ? "text-gradient-gold" : ""}`}
    >
      {word}&nbsp;
    </motion.span>
  );
};

/**
 * The manifesto: a cinematic statement where each word ignites as you scroll.
 */
const ManifestoSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.82", "end 0.38"] });

  return (
    <section className="relative overflow-hidden bg-background">
      <EmberGlow intensity="low" />
      <div className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7 }}
            className="mb-10 flex items-center gap-4"
          >
            <span className="h-px w-12 bg-accent/70" />
            <p className="kicker">The Manifesto</p>
          </motion.div>

          <div ref={ref}>
            <p className="font-heading text-3xl leading-[1.25] tracking-wide text-foreground sm:text-5xl sm:leading-[1.2] lg:text-6xl lg:leading-[1.15]">
              {WORDS.map((word, i) => (
                <Word key={i} word={word} index={i} total={WORDS.length} progress={scrollYProgress} />
              ))}
            </p>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-12 font-display italic text-xl text-muted-foreground sm:text-2xl"
          >
            "For I am not ashamed of the gospel…"
            <span className="ml-3 font-body text-sm not-italic tracking-[0.3em] uppercase text-accent">
              Romans 1:16
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default ManifestoSection;
