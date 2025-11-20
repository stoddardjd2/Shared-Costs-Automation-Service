import { motion } from "framer-motion";

export default function FadeInWrapper({
  children,
  delaySec = 0.1,
  className = "",
  initial = { opacity: 0, y: 25}
}) {
  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: delaySec,
      }}
      className={className}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
