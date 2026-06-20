"use client";

import { motion } from "motion/react";
import TypewriterText from "./TypewriterText";
import type { Speaker } from "@/lib/trialTypes";

const speakerDetails: Record<Speaker, { name: string; role: string; mark: string }> = {
  judge: { name: "Cornelius Reginald Hawthorne III", role: "Presiding Judge", mark: "III" },
  internet: { name: "The Internet", role: "For the Prosecution", mark: "www" },
  gerald: { name: "Gerald Finch", role: "Counsel for Common Sense", mark: "GF" },
};

interface DialogueCardProps {
  speaker: Speaker;
  text: string;
  typewriter?: boolean;
  compact?: boolean;
  active?: boolean;
  speed?: number;
  skipSignal?: number;
  onTypingStart?: () => void;
  onTypingComplete?: () => void;
}

export default function DialogueCard({
  speaker,
  text,
  typewriter = true,
  compact = false,
  active = true,
  speed,
  skipSignal,
  onTypingStart,
  onTypingComplete,
}: DialogueCardProps) {
  const details = speakerDetails[speaker];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`dialogue-card dialogue-${speaker} ${compact ? "dialogue-compact" : ""} ${active ? "dialogue-active" : "dialogue-receded"}`}
      aria-current={active ? "true" : undefined}
    >
      <header className="dialogue-header">
        <div className="speaker-mark" aria-hidden="true">{details.mark}</div>
        <div>
          <p className="speaker-name">{details.name}</p>
          <p className="speaker-role">{details.role}</p>
        </div>
        {active && <span className="speaking-indicator">Speaking</span>}
      </header>
      <p className="dialogue-copy">
        {typewriter ? (
          <TypewriterText
            text={text}
            speed={speed ?? (compact ? 18 : speaker === "judge" ? 27 : 23)}
            delay={compact ? 90 : 150}
            skipSignal={skipSignal}
            onStart={onTypingStart}
            onComplete={onTypingComplete}
          />
        ) : text}
      </p>
    </motion.article>
  );
}
