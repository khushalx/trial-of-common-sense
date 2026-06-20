"use client";

import { motion } from "motion/react";
import SoundToggle from "./SoundToggle";

interface CourtroomLoadingProps {
  bang: number;
  topic: string;
  soundEnabled: boolean;
  onToggleSound: () => void | Promise<void>;
}

export default function CourtroomLoading({ bang, topic, soundEnabled, onToggleSound }: CourtroomLoadingProps) {
  const loadingAside = bang < 2
    ? "Court stenographer is sweating."
    : "Gerald is preparing a reasonable argument nobody requested.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#120d0a]/95 px-6 text-center"
    >
      <SoundToggle enabled={soundEnabled} onToggle={onToggleSound} className="loading-sound-toggle" />
      <motion.div
        key={bang}
        initial={{ rotate: -34, x: 15, y: -24 }}
        animate={{ rotate: 2, x: 0, y: 0 }}
        transition={{ duration: 0.18, ease: [0.7, 0, 1, 1] }}
        className="gavel-icon"
        aria-hidden="true"
      >
        🔨
      </motion.div>
      <motion.div
        key={`impact-${bang}`}
        initial={{ opacity: 0.8, scaleX: 0.2 }}
        animate={{ opacity: 0, scaleX: 2.2 }}
        transition={{ duration: 0.7 }}
        className="gavel-impact"
      />
      <p className="mt-8 font-serif text-2xl uppercase tracking-[0.28em] text-cream sm:text-3xl">
        {bang > 0 ? "Order" : "Court is assembling"}
      </p>
      <p className="mt-3 max-w-md text-xs uppercase tracking-[0.22em] text-brass">
        The People v. Common Sense · {topic}
      </p>
      <motion.p
        key={loadingAside}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="loading-aside"
      >
        {loadingAside}
      </motion.p>
      <p className="loading-record-status" role="status">Court clerk is assembling the live record.</p>
      <div className="mt-7 flex gap-3" aria-label={`${bang} of 3 gavel bangs`}>
        {[1, 2, 3].map((number) => (
          <span key={number} className={`h-1 w-10 ${number <= bang ? "bg-brass" : "bg-[#4e4034]"}`} />
        ))}
      </div>
    </motion.div>
  );
}
