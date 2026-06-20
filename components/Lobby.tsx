"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { getRandomAbsurdTopic } from "@/lib/absurdTopics";
import SoundToggle from "./SoundToggle";
import CaseFiles from "./CaseFiles";
import { useSoundPreference } from "@/src/hooks/useSoundPreference";

export default function Lobby() {
  const router = useRouter();
  const { soundEnabled, toggleSound } = useSoundPreference();
  const [topic, setTopic] = useState("");
  const [error, setError] = useState(false);

  function beginTrial(event?: FormEvent) {
    event?.preventDefault();
    const cleaned = topic.trim();
    if (!cleaned) {
      setError(true);
      return;
    }
    router.push(`/trial?topic=${encodeURIComponent(cleaned)}`);
  }

  function assignCase() {
    const assigned = getRandomAbsurdTopic(topic);
    setTopic(assigned);
    setError(false);
  }

  return (
    <main className="lobby-shell min-h-screen overflow-x-hidden text-cream">
      <div className="court-noise" aria-hidden="true" />
      <SoundToggle enabled={soundEnabled} onToggle={toggleSound} className="lobby-sound-toggle" />
      <div className="lobby-architecture" aria-hidden="true">
        <div className="court-column court-column-left" />
        <div className="court-column court-column-right" />
        <div className="court-doors">
          <div className="door-panel door-panel-left" />
          <div className="door-seam" />
          <div className="door-panel door-panel-right" />
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 text-center"
      >
        <div className="court-seal" aria-hidden="true">
          <span>§</span>
        </div>
        <div className="lobby-case-line" aria-hidden="true">
          <span />
          <p>Case intake · 0047-∞</p>
          <span />
        </div>
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.42em] text-brass sm:text-xs">
          The Honorable Court of Public Opinion
        </p>
        <h1 className="lobby-title max-w-4xl text-5xl leading-[0.94] sm:text-7xl lg:text-[6.5rem]">
          The Trial of<br />Common Sense
        </h1>
        <p className="mt-7 max-w-xl font-serif text-lg italic text-[#cbbfa9] sm:text-xl">
          Any topic goes on trial. Common sense always loses.
        </p>

        <form onSubmit={beginTrial} className="mt-12 w-full max-w-2xl">
          <label htmlFor="topic" className="sr-only">Enter a topic for trial</label>
          <div className={`case-entry ${error ? "case-entry-error" : ""}`}>
            <span className="case-entry-label">Matter before the court</span>
            <input
              id="topic"
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setError(false);
              }}
              placeholder="e.g. putting pineapple on pizza"
              autoComplete="off"
              maxLength={120}
              className="w-full bg-transparent px-5 pb-5 pt-9 text-center font-serif text-lg text-ink outline-none placeholder:text-[#786f60] sm:text-xl"
            />
          </div>
          <p className={`mt-2 h-5 text-xs tracking-wide text-[#d28b7e] ${error ? "opacity-100" : "opacity-0"}`}>
            The court requires a controversy, however small.
          </p>

          <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <button type="submit" className="gavel-button group">
              <span className="mr-3 inline-block transition-transform duration-150 group-active:rotate-[-18deg]">⚖</span>
              Bang the Gavel
            </button>
            <button type="button" onClick={assignCase} className="secondary-court-button">
              Assign Me an Absurd Case
            </button>
          </div>
        </form>

        <CaseFiles />

        <p className="lobby-disclaimer mt-9 text-[9px] uppercase tracking-[0.32em] text-[#817567]">
          All proceedings are final, theatrical, and deeply unreasonable
        </p>
      </motion.section>
    </main>
  );
}
