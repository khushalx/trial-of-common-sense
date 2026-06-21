"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { getRandomAbsurdTopic } from "@/lib/absurdTopics";
import SoundToggle from "./SoundToggle";
import CaseFiles from "./CaseFiles";
import { useSoundPreference } from "@/src/hooks/useSoundPreference";

const exampleCases = [
  "Is a hotdog a sandwich?",
  "Was Thanos right?",
  "Should pineapple go on pizza?",
  "Are group projects a war crime?",
  "Is waking up early propaganda?",
  "Should exams be abolished?",
];

const trialSteps = [
  { number: "01", title: "Submit a topic", detail: "Any controversy, however unnecessary." },
  { number: "02", title: "The Internet prosecutes", detail: "Confidence arrives before evidence." },
  { number: "03", title: "You try to help Gerald", detail: "Reason is entered into the record." },
  { number: "04", title: "Common Sense is found guilty", detail: "The court was never undecided." },
];

const characters = [
  { mark: "III", name: "Judge Hawthorne", role: "Presiding Judge", note: "Victorian, pompous, and deeply suspicious of electricity." },
  { mark: "www", name: "The Internet", role: "For the Prosecution", note: "Contradictory, overconfident, and always trending." },
  { mark: "GF", name: "Gerald Finch", role: "Counsel for Common Sense", note: "Calm, prepared, reasonable, and comprehensively doomed." },
  { mark: "12", name: "The Jury", role: "Impartialish Peers", note: "Twelve strangers united by one incorrect conclusion." },
];

export default function Lobby() {
  const router = useRouter();
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState(false);
  const { soundEnabled, toggleSound } = useSoundPreference();

  function beginTrial(event?: FormEvent, submittedTopic = topic) {
    event?.preventDefault();
    const cleaned = submittedTopic.trim();
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

  function chooseExample(example: string) {
    setTopic(example);
    setError(false);
    window.setTimeout(() => heroInputRef.current?.focus(), 0);
  }

  return (
    <main className="lobby-shell landing-page min-h-screen overflow-x-hidden text-cream">
      <div className="court-noise" aria-hidden="true" />
      <SoundToggle enabled={soundEnabled} onToggle={toggleSound} className="lobby-sound-toggle" />

      <section className="lobby-hero">
        <div className="lobby-architecture" aria-hidden="true">
          <div className="court-column court-column-left" />
          <div className="court-column court-column-right" />
          <div className="court-doors">
            <div className="door-panel door-panel-left" />
            <div className="door-seam" />
            <div className="door-panel door-panel-right" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="lobby-hero-content"
        >
          <div className="court-seal" aria-hidden="true"><span>§</span></div>
          <div className="lobby-case-line" aria-hidden="true">
            <span />
            <p>Case intake · 0047-∞</p>
            <span />
          </div>
          <p className="lobby-court-label">The Honorable Court of Public Opinion</p>
          <h1 className="lobby-title">The Trial of<br />Common Sense</h1>
          <p className="lobby-tagline">Any topic goes on trial. Common sense always loses.</p>

          <form onSubmit={beginTrial} className="hero-case-form">
            <label htmlFor="topic" className="sr-only">Enter a topic for trial</label>
            <div className={`case-entry ${error ? "case-entry-error" : ""}`}>
              <span className="case-entry-label">Matter before the court</span>
              <input
                ref={heroInputRef}
                id="topic"
                value={topic}
                onChange={(event) => {
                  setTopic(event.target.value);
                  setError(false);
                }}
                placeholder="e.g. putting pineapple on pizza"
                autoComplete="off"
                maxLength={120}
              />
            </div>
            <p className={`case-entry-error-message ${error ? "opacity-100" : "opacity-0"}`}>
              The court requires a controversy, however small.
            </p>

            <div className="hero-actions">
              <button type="submit" className="gavel-button group">
                <span className="gavel-button-mark">⚖</span>
                Bang the Gavel
              </button>
              <button type="button" onClick={assignCase} className="secondary-court-button">
                Assign Me an Absurd Case
              </button>
            </div>
          </form>

          <div className="example-case-files" aria-label="Example cases">
            <p>Recent matters suitable for unnecessary litigation</p>
            <div>
              {exampleCases.map((example, index) => (
                <button key={example} type="button" onClick={() => chooseExample(example)}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {example}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <div className="landing-sections">
        <CaseFiles />

        <section className="landing-section process-section">
          <header className="landing-section-heading">
            <p>Procedure of the court</p>
            <h2>How the Trial Works</h2>
          </header>
          <div className="legal-process-board">
            {trialSteps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section characters-section">
          <header className="landing-section-heading">
            <p>Officers and interested parties</p>
            <h2>Meet the Court</h2>
          </header>
          <div className="landing-character-grid">
            {characters.map((character) => (
              <article key={character.name} className={`landing-character character-${character.mark.toLowerCase()}`}>
                <div className="character-mark" aria-hidden="true">{character.mark}</div>
                <h3>{character.name}</h3>
                <span>{character.role}</span>
                <p>{character.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section difference-section">
          <div className="difference-statement">
            <p className="difference-label">What makes it different</p>
            <h2>Uncertainty inside a fixed fate.</h2>
            <p>Most AI apps generate uncertain outcomes. This court has no such administrative weakness.</p>
          </div>
          <div className="difference-record">
            <article>
              <span>Variable</span>
              <h3>The proceedings</h3>
              <p>The evidence, objections, jurors, and absurdity change every time.</p>
            </article>
            <article>
              <span>Final</span>
              <h3>The verdict</h3>
              <p>Common Sense is always found guilty. The court appreciates your concern.</p>
            </article>
          </div>
        </section>

        <section className="final-case-cta">
          <div className="final-cta-seal" aria-hidden="true">§</div>
          <p>One final matter</p>
          <h2>Put Another Topic on Trial</h2>
          <form onSubmit={beginTrial}>
            <label htmlFor="final-topic" className="sr-only">Enter another topic for trial</label>
            <input
              id="final-topic"
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setError(false);
              }}
              placeholder="State the charge..."
              maxLength={120}
              autoComplete="off"
            />
            <button type="submit">Bang the Gavel</button>
          </form>
        </section>

        <footer className="landing-footer">
          <span>Case No. 0047-∞</span>
          <p>All proceedings are final, theatrical, and deeply unreasonable.</p>
          <span>Reason not admitted</span>
        </footer>
      </div>
    </main>
  );
}
