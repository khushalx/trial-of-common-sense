"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { TrialScript } from "@/lib/trialTypes";
import SoundToggle from "./SoundToggle";
import CounselChoicePanel from "./CounselChoicePanel";
import CourtRecord from "./CourtRecord";
import { playerInteractions } from "@/lib/playerInteractions";
import type { CounselChoice, PlayerSelections } from "@/lib/playerInteractions";
import {
  playStamp,
  playVerdictImpact,
  startVerdictRumble,
  stopAllSound,
  stopVerdictRumble,
} from "@/src/lib/sound";

const VERDICT_PAUSE_MS = 3_000;

export default function VerdictScreen({
  trial,
  soundEnabled,
  onToggleSound,
  selections,
  failedObjections,
  onSelectFinalReaction,
  onTrialComplete,
}: {
  trial: TrialScript;
  soundEnabled: boolean;
  onToggleSound: () => void | Promise<void>;
  selections: PlayerSelections;
  failedObjections: string[];
  onSelectFinalReaction: (choice: CounselChoice) => void;
  onTrialComplete: () => void;
}) {
  const router = useRouter();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [verdictRevealed, setVerdictRevealed] = useState(false);
  const soundEnabledRef = useRef(soundEnabled);
  const onTrialCompleteRef = useRef(onTrialComplete);
  const canonicalShareText = `Common Sense was found GUILTY of ${trial.topic} in Case No. ${trial.caseNumber}. Gerald sends his condolences.`;

  useEffect(() => {
    onTrialCompleteRef.current = onTrialComplete;
  }, [onTrialComplete]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    if (!verdictRevealed && soundEnabled) startVerdictRumble();
    else stopVerdictRumble();
  }, [soundEnabled, verdictRevealed]);

  useEffect(() => {
    let impact: number | undefined;
    let stamp: number | undefined;
    const reveal = window.setTimeout(() => {
      stopVerdictRumble();
      setVerdictRevealed(true);
      onTrialCompleteRef.current();
      impact = window.setTimeout(() => {
        if (soundEnabledRef.current) playVerdictImpact();
      }, 420);
      stamp = window.setTimeout(() => {
        if (soundEnabledRef.current) playStamp();
      }, 1_150);
    }, VERDICT_PAUSE_MS);

    return () => {
      window.clearTimeout(reveal);
      if (impact) window.clearTimeout(impact);
      if (stamp) window.clearTimeout(stamp);
      stopAllSound();
    };
  }, []);

  async function copyVerdict() {
    try {
      await navigator.clipboard.writeText(canonicalShareText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    window.setTimeout(() => setCopyStatus("idle"), 2_400);
  }

  return (
    <motion.section
      initial={false}
      animate={{ backgroundColor: verdictRevealed ? "rgba(69,8,7,.98)" : "rgba(10,7,6,.99)" }}
      transition={{ duration: verdictRevealed ? 0.15 : 0.6 }}
      className={`verdict-screen ${verdictRevealed ? "verdict-revealed" : "verdict-pending"}`}
    >
      <SoundToggle enabled={soundEnabled} onToggle={onToggleSound} className="verdict-sound-toggle" />
      <AnimatePresence>
        {!verdictRevealed && (
          <motion.div
            key="verdict-pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65 }}
            className="verdict-suspense"
          >
            <span className="case-number-badge">Case No. {trial.caseNumber}</span>
            <div className="foreperson-seal" aria-hidden="true">§</div>
            <p>The foreperson rises.</p>
            <h1>{trial.verdict.pauseText}</h1>
            <motion.div
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="verdict-pause-mark"
              aria-label="The court pauses for three seconds"
            >
              · · ·
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {verdictRevealed && (
        <>
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="verdict-red-flash"
            aria-hidden="true"
          />

          <div className="falling-gavels" aria-hidden="true">
            {Array.from({ length: 15 }).map((_, index) => (
              <motion.span
                key={index}
                initial={{ y: -120, rotate: index % 2 ? -20 : 25, opacity: 0 }}
                animate={{ y: "110vh", rotate: index % 2 ? 260 : -240, opacity: [0, 0.2, 0.1] }}
                transition={{ duration: 5 + (index % 4), delay: 0.07 * index, repeat: Infinity, repeatDelay: 2 }}
                style={{ left: `${2 + index * 6.8}%` }}
              >
                🔨
              </motion.span>
            ))}
          </div>

          <div className="verdict-content">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="verdict-kicker-row"
            >
              <span className="case-number-badge">Case No. {trial.caseNumber}</span>
              <p className="verdict-kicker">In the Court of Public Opinion</p>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, scale: 1.55, filter: "blur(5px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.42, duration: 0.42, ease: [0.7, 0, 0.84, 0] }}
              className="verdict-word"
            >
              {trial.verdict.status}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.75 }}
              className="verdict-details"
            >
              <p className="sentencing"><span>Sentence of the court:</span> {trial.verdict.sentencing}</p>
              <CounselChoicePanel
                interaction={playerInteractions.finalReaction}
                selected={selections.finalReaction}
                onSelect={onSelectFinalReaction}
                dark
              />
              <CourtRecord selections={selections} failedObjections={failedObjections} />
              <div className="share-verdict-card">
                <p className="share-label">The Court Has Ruled</p>
                <div className="verdict-card-heading">
                  <span>Case No. {trial.caseNumber}</span>
                  <strong>Verdict: {trial.verdict.status}</strong>
                </div>
                <h2>{trial.topic}</h2>
                <p className="gerald-condolence">Gerald Finch sends his condolences and a heavily annotated appeal form.</p>
                <p className="selectable-verdict-text">{canonicalShareText}</p>
                <div className="verdict-card-actions">
                  <button type="button" onClick={copyVerdict} className="copy-verdict-button">Copy Verdict</button>
                  <button type="button" onClick={() => router.push("/")} className="new-trial-button">New Trial</button>
                </div>
                <p className={`copy-status copy-status-${copyStatus}`} role="status">
                  {copyStatus === "copied" && "Copied to court record."}
                  {copyStatus === "failed" && "Clipboard unavailable. Select the ruling above."}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.section>
  );
}
