import { motion } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

const TextReveal = ({
  text,
  className = "",
  delay = 0,
  stagger = 0.04,
  as: Tag = "span",
}: TextRevealProps) => {
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 40, rotateX: -40 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="overflow-hidden"
      style={{ perspective: "600px" }}
    >
      <Tag className={className} style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.25em" }}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={child}
            style={{ display: "inline-block", transformOrigin: "bottom" }}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    </motion.div>
  );
};

export default TextReveal;
