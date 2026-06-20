"use client";

import { motion } from "motion/react";
import type { TrialJuror } from "@/lib/trialTypes";

interface JuryBoxProps {
  jurors: TrialJuror[];
  revealedCount: number;
  featured?: boolean;
}

export default function JuryBox({ jurors, revealedCount, featured = false }: JuryBoxProps) {
  return (
    <aside className={`jury-box ${featured ? "jury-box-featured" : ""}`} aria-label="Jury box">
      <div className="jury-heading">
        <span>The Jury</span>
        <span>{revealedCount}/12</span>
      </div>
      <div className="jury-grid">
        {jurors.map((juror, index) => {
          const revealed = index < revealedCount;
          return (
            <motion.article
              key={`${juror.name}-${index}`}
              animate={{
                opacity: revealed ? 1 : 0.32,
                filter: revealed ? "grayscale(0%)" : "grayscale(100%)",
                y: revealed ? 0 : 2,
              }}
              transition={{ duration: 0.38 }}
              className={`juror-card ${revealed ? "juror-revealed" : ""}`}
            >
              <span className="juror-portrait" aria-hidden="true">{juror.emoji}</span>
              <div className="min-w-0">
                <h3>{juror.name}</h3>
                {featured && revealed && <p>{juror.line}</p>}
              </div>
              {revealed && <span className="juror-vote">Guilty</span>}
            </motion.article>
          );
        })}
      </div>
    </aside>
  );
}
