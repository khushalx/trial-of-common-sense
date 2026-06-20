"use client";

import { AnimatePresence, motion } from "motion/react";
import type { TrialExhibit } from "@/lib/trialTypes";

interface EvidenceBoardProps {
  exhibits: TrialExhibit[];
  visibleCount: number;
  featured?: boolean;
}

export default function EvidenceBoard({ exhibits, visibleCount, featured = false }: EvidenceBoardProps) {
  return (
    <aside className={`evidence-board ${featured ? "evidence-board-featured" : ""}`} aria-label="Evidence board">
      <div className="board-heading">
        <span>People&apos;s Exhibits</span>
        <span className="board-case-mark">47∞</span>
      </div>
      <div className="evidence-list">
        <AnimatePresence>
          {exhibits.slice(0, visibleCount).map((exhibit, index) => (
            <motion.article
              key={exhibit.label}
              initial={{ opacity: 0, y: -18, rotate: index % 2 ? 1.5 : -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: index % 2 ? 0.7 : -0.7 }}
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
              className="evidence-paper"
            >
              <span className="evidence-pin" aria-hidden="true" />
              <p className="exhibit-label">{exhibit.label}</p>
              <h3>{exhibit.title}</h3>
              <p className="evidence-claim">{exhibit.description}</p>
              <span className="admitted-stamp">Admitted</span>
            </motion.article>
          ))}
        </AnimatePresence>
        {visibleCount === 0 && (
          <div className="empty-evidence">
            <span>Evidence pending</span>
            <div className="empty-paper-outline" />
          </div>
        )}
      </div>
    </aside>
  );
}
