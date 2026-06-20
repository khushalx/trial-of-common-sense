"use client";

import { motion } from "motion/react";
import type { CounselChoice, InteractionDefinition } from "@/lib/playerInteractions";

interface CounselChoicePanelProps {
  interaction: InteractionDefinition;
  selected?: CounselChoice;
  onSelect: (choice: CounselChoice) => void;
  dark?: boolean;
}

export default function CounselChoicePanel({ interaction, selected, onSelect, dark = false }: CounselChoicePanelProps) {
  const filingPrefix = interaction.id === "objection"
    ? "Gerald rises"
    : interaction.id === "followUp"
      ? "Gerald asks"
      : "Entered into the record";
  const resultStamp = interaction.id === "objection"
    ? "Overruled"
    : interaction.id === "appeal"
      ? "Denied"
      : interaction.id === "finalReaction"
        ? "Filed"
        : "Ignored";

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`counsel-note ${dark ? "counsel-note-dark" : ""}`}
    >
      <header>
        <span>Associate Counsel for Common Sense</span>
        <p>{interaction.eyebrow}</p>
      </header>
      <h3>{interaction.prompt}</h3>

      {!selected ? (
        <div className="counsel-options">
          {interaction.options.map((option, index) => (
            <button key={option.label} type="button" onClick={() => onSelect(option)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="counsel-consequence">
          <p className="selected-filing">{filingPrefix}: {selected.label}</p>
          <p>{selected.reaction}</p>
          <span className="overruled-mark">{resultStamp}</span>
        </motion.div>
      )}
    </motion.section>
  );
}
