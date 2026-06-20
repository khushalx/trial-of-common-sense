"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import CourtroomLoading from "./CourtroomLoading";
import CounselChoicePanel from "./CounselChoicePanel";
import CourtRecord from "./CourtRecord";
import DialogueCard from "./DialogueCard";
import EvidenceBoard from "./EvidenceBoard";
import JuryBox from "./JuryBox";
import SoundToggle from "./SoundToggle";
import TypewriterText from "./TypewriterText";
import VerdictScreen from "./VerdictScreen";
import { getFallbackTrial } from "@/lib/fallbackTrial";
import { playerInteractions } from "@/lib/playerInteractions";
import type { CounselChoice, InteractionId, PlayerSelections } from "@/lib/playerInteractions";
import type { Speaker, TrialGenerationResponse, TrialScript, TrialPhase } from "@/lib/trialTypes";
import { useSoundPreference } from "@/src/hooks/useSoundPreference";
import { saveCaseFile } from "@/src/lib/caseFiles";
import { validateTrialOrFallback } from "@/src/lib/validateTrial";
import {
  playGavel,
  playPaper,
  playWoodKnock,
  startAmbience,
  stopAllSound,
  stopAmbience,
  unlockAudio,
} from "@/src/lib/sound";

type TextSpeed = "slow" | "normal" | "fast";

interface DialogueStep {
  id: string;
  kind: "dialogue";
  speaker: Speaker;
  text: string;
  compact?: boolean;
  exhibitIndex?: number;
  introducesExhibit?: boolean;
}

interface InteractionStep {
  id: string;
  kind: "interaction";
  interactionId: InteractionId;
}

interface JuryStep {
  id: string;
  kind: "jury";
  jurorIndex: number;
}

type SceneStep = DialogueStep | InteractionStep | JuryStep;

const phases: TrialPhase[] = [
  "ORDER",
  "OPENING STATEMENTS",
  "EXHIBITS",
  "CROSS-EXAMINATION",
  "CLOSING ARGUMENTS",
  "JURY DELIBERATION",
  "VERDICT",
];

const sceneLabels = [
  "Court Called to Order",
  "Opening Statements",
  "Evidence Presented",
  "Cross-Examination",
  "Closing Arguments",
  "Jury Deliberation",
  "Sentencing",
] as const;

const speedValues: Record<TextSpeed, number> = {
  slow: 42,
  normal: 27,
  fast: 15,
};

const ASSEMBLY_DURATION = 3_100;

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function buildSceneSteps(trial: TrialScript): SceneStep[][] {
  const judgeOpening = trial.judgeOpening.toLocaleLowerCase().includes(trial.mispronouncedTopic.toLocaleLowerCase())
    ? trial.judgeOpening
    : `The clerk will record this matter as “${trial.mispronouncedTopic}.” ${trial.judgeOpening}`;
  const exhibitSteps = trial.exhibits.flatMap<SceneStep>((exhibit, index) => {
    const baseSteps: SceneStep[] = [
      {
        id: `exhibit-${index}-presented`,
        kind: "dialogue",
        speaker: "internet",
        text: `${exhibit.label}: ${exhibit.title}. ${exhibit.description}`,
        compact: true,
        exhibitIndex: index,
        introducesExhibit: true,
      },
      {
        id: `exhibit-${index}-judge-reaction`,
        kind: "dialogue",
        speaker: "judge",
        text: exhibit.judgeReaction,
        compact: true,
        exhibitIndex: index,
      },
    ];

    if (index === 0) {
      baseSteps.push({ id: "player-objection", kind: "interaction", interactionId: "objection" });
    } else {
      baseSteps.push({
        id: `exhibit-${index}-gerald-objection`,
        kind: "dialogue",
        speaker: "gerald",
        text: exhibit.geraldObjection,
        compact: true,
        exhibitIndex: index,
      });
    }

    if (index > 0) {
      baseSteps.push({
        id: `exhibit-${index}-overruled`,
        kind: "dialogue",
        speaker: "judge",
        text: exhibit.judgeOverrule,
        compact: true,
        exhibitIndex: index,
      });
    }
    return baseSteps;
  });

  return [
    [
      { id: "judge-opening", kind: "dialogue", speaker: "judge", text: judgeOpening },
    ],
    [
      { id: "player-advice", kind: "interaction", interactionId: "advice" },
      { id: "internet-opening", kind: "dialogue", speaker: "internet", text: trial.openingStatements.internet },
      { id: "gerald-opening", kind: "dialogue", speaker: "gerald", text: trial.openingStatements.gerald },
    ],
    exhibitSteps,
    [
      { id: "gerald-first-question", kind: "dialogue", speaker: "gerald", text: trial.crossExamination.geraldQuestion, compact: true },
      { id: "internet-first-answer", kind: "dialogue", speaker: "internet", text: trial.crossExamination.internetAnswer, compact: true },
      { id: "player-follow-up", kind: "interaction", interactionId: "followUp" },
      { id: "judge-confusion", kind: "dialogue", speaker: "judge", text: trial.crossExamination.judgeConfusion, compact: true },
      { id: "gerald-gives-up", kind: "dialogue", speaker: "gerald", text: trial.crossExamination.geraldGivesUp, compact: true },
    ],
    [
      { id: "gerald-closing", kind: "dialogue", speaker: "gerald", text: trial.closingArguments.gerald },
      { id: "internet-closing", kind: "dialogue", speaker: "internet", text: trial.closingArguments.internet },
    ],
    [
      { id: "player-final-appeal", kind: "interaction", interactionId: "appeal" },
      ...trial.jury.map<SceneStep>((_, jurorIndex) => ({
        id: `juror-${jurorIndex}`,
        kind: "jury",
        jurorIndex,
      })),
    ],
    [],
  ];
}

export default function TrialStage({ topic }: { topic: string }) {
  const [trial, setTrial] = useState<TrialScript | null>(null);
  const [gavelBang, setGavelBang] = useState(0);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const { soundEnabled, toggleSound } = useSoundPreference();
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    if (!topic) return;
    let active = true;
    const controller = new AbortController();
    const startedAt = Date.now();
    const registerBang = (number: number) => {
      setGavelBang(number);
      if (soundEnabledRef.current) playGavel();
    };
    const bangs = [
      window.setTimeout(() => registerBang(1), 450),
      window.setTimeout(() => registerBang(2), 1_320),
      window.setTimeout(() => registerBang(3), 2_190),
    ];

    async function generateTrial() {
      let script: TrialScript;
      let notice: string | null = null;

      try {
        const response = await fetch("/api/generate-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Trial generation request failed");
        const data = await response.json() as TrialGenerationResponse;
        script = validateTrialOrFallback(data.trial, topic);
        if (script.isFallback) notice = "Court stenographer used archived proceedings.";
      } catch (error) {
        console.warn("[trial-generation] Live proceedings were unavailable; using the archive.", error);
        script = getFallbackTrial(topic);
        notice = "Court stenographer used archived proceedings.";
      }

      const remainingAssemblyTime = Math.max(0, ASSEMBLY_DURATION - (Date.now() - startedAt));
      await wait(remainingAssemblyTime);
      if (active) {
        setTrial(script);
        setGenerationNotice(notice);
      }
    }

    void generateTrial();

    return () => {
      active = false;
      controller.abort();
      bangs.forEach(window.clearTimeout);
    };
  }, [topic]);

  if (!topic) {
    return (
      <main className="trial-shell min-h-screen text-cream">
        <div className="court-noise" aria-hidden="true" />
        <section className="missing-topic-state">
          <span aria-hidden="true">§</span>
          <p>No matter is before the court</p>
          <h1>The clerk cannot try an empty case file.</h1>
          <button type="button" onClick={() => window.location.assign("/")}>Return to Case Intake</button>
        </section>
      </main>
    );
  }

  if (!trial) {
    return (
      <main className="trial-shell relative min-h-screen text-cream">
        <div className="court-noise" aria-hidden="true" />
        <CourtroomLoading
          bang={gavelBang}
          topic={topic}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      </main>
    );
  }

  return (
    <TrialPerformance
      trial={trial}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      generationNotice={generationNotice}
    />
  );
}

function TrialPerformance({
  trial,
  soundEnabled,
  onToggleSound,
  generationNotice,
}: {
  trial: TrialScript;
  soundEnabled: boolean;
  onToggleSound: () => void | Promise<void>;
  generationNotice: string | null;
}) {
  const router = useRouter();
  const sceneSteps = useMemo(() => buildSceneSteps(trial), [trial]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [visibleExhibits, setVisibleExhibits] = useState(0);
  const [revealedJurors, setRevealedJurors] = useState(0);
  const [selections, setSelections] = useState<PlayerSelections>({});
  const [failedObjections, setFailedObjections] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [textSpeed, setTextSpeed] = useState<TextSpeed>("normal");
  const [isTyping, setIsTyping] = useState(false);
  const [lineComplete, setLineComplete] = useState(false);
  const [skipSignal, setSkipSignal] = useState(0);
  const soundEnabledRef = useRef(soundEnabled);
  const previousPhaseRef = useRef(0);

  const currentStep = sceneSteps[phaseIndex]?.[stepIndex];
  const currentSelection = currentStep?.kind === "interaction"
    ? selections[currentStep.interactionId]
    : undefined;

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    let active = true;
    if (soundEnabled && phaseIndex < phases.length - 1) {
      void unlockAudio().then((unlocked) => {
        if (active && unlocked) startAmbience();
      });
    } else {
      stopAmbience();
    }
    return () => {
      active = false;
    };
  }, [phaseIndex, soundEnabled]);

  useEffect(() => () => stopAllSound(), []);

  useEffect(() => {
    if (phaseIndex !== previousPhaseRef.current) {
      if (soundEnabledRef.current && phaseIndex < phases.length - 1) playWoodKnock();
      previousPhaseRef.current = phaseIndex;
    }
  }, [phaseIndex]);

  useEffect(() => {
    setLineComplete(false);
    setIsTyping(currentStep?.kind !== "interaction");

    if (currentStep?.kind === "dialogue" && currentStep.introducesExhibit && currentStep.exhibitIndex !== undefined) {
      setVisibleExhibits((current) => Math.max(current, currentStep.exhibitIndex! + 1));
      if (soundEnabledRef.current) playPaper();
    }

    if (currentStep?.kind === "jury") {
      setRevealedJurors(currentStep.jurorIndex + 1);
      if (soundEnabledRef.current) playWoodKnock(true);
    }
  }, [currentStep]);

  const advanceStep = useCallback(() => {
    const phaseStepCount = sceneSteps[phaseIndex]?.length ?? 0;
    if (stepIndex < phaseStepCount - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    if (phaseIndex < phases.length - 1) {
      setPhaseIndex((current) => current + 1);
      setStepIndex(0);
    }
  }, [phaseIndex, sceneSteps, stepIndex]);

  const saveCompletedTrial = useCallback(() => {
    saveCaseFile(trial);
  }, [trial]);

  useEffect(() => {
    if (!autoPlay || !lineComplete || currentStep?.kind === "interaction") return;
    const next = window.setTimeout(advanceStep, 1_800);
    return () => window.clearTimeout(next);
  }, [advanceStep, autoPlay, currentStep?.kind, lineComplete]);

  function chooseInteraction(interactionId: InteractionId, choice: CounselChoice) {
    setSelections((current) => ({ ...current, [interactionId]: choice }));
    if (interactionId === "objection") {
      setFailedObjections((current) => current.includes(choice.label) ? current : [...current, choice.label]);
    }
    setIsTyping(false);
    setLineComplete(true);
  }

  function skipToVerdict() {
    setVisibleExhibits(trial.exhibits.length);
    setRevealedJurors(trial.jury.length);
    setPhaseIndex(phases.length - 1);
    setStepIndex(0);
  }

  function handleStageClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button, summary, a")) return;
    if (currentStep?.kind === "interaction") return;
    if (isTyping) setSkipSignal((current) => current + 1);
    else if (lineComplete) advanceStep();
  }

  if (phaseIndex === phases.length - 1) {
    return (
      <VerdictScreen
        trial={trial}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        selections={selections}
        failedObjections={failedObjections}
        onSelectFinalReaction={(choice) => chooseInteraction("finalReaction", choice)}
        onTrialComplete={saveCompletedTrial}
      />
    );
  }

  const currentPhase = sceneLabels[phaseIndex];
  const activeJuror = currentStep?.kind === "jury" ? trial.jury[currentStep.jurorIndex] : null;
  const isLastStep = stepIndex === (sceneSteps[phaseIndex]?.length ?? 1) - 1;
  const canContinue = currentStep?.kind === "interaction" ? Boolean(currentSelection) : lineComplete;

  return (
    <main className="trial-shell min-h-screen text-cream">
      <div className="court-noise" aria-hidden="true" />

      <header className="trial-topbar">
        <div>
          <p className="trial-court-name">Court of Public Opinion</p>
          <p className="trial-case-number">Case No. {trial.caseNumber}</p>
        </div>
        <p className="trial-topic" title={trial.topic}>The People v. Common Sense <span>re: {trial.topic}</span></p>
        <div className="trial-controls">
          <SoundToggle enabled={soundEnabled} onToggle={onToggleSound} />
          <button type="button" onClick={skipToVerdict}>Skip to Verdict</button>
          <button type="button" onClick={() => router.push("/")}>New Trial</button>
        </div>
      </header>

      {generationNotice && (
        <div className="fallback-mode-indicator" role="status" title="The generated transcript was unavailable or invalid.">
          {generationNotice}
        </div>
      )}

      <nav className="phase-indicator" aria-label="Trial progress">
        {phases.map((phase, index) => (
          <div key={phase} className={index === phaseIndex ? "phase-current" : index < phaseIndex ? "phase-complete" : ""}>
            <span>{index < phaseIndex ? "✓" : index + 1}</span>
            <p>{phase}</p>
          </div>
        ))}
      </nav>

      <section className={`judge-bench ${phaseIndex === 0 ? "judge-bench-active" : ""}`} aria-label="Judge's bench">
        <div className="judge-crest" aria-hidden="true">§</div>
        <div className="judge-identity">
          <p>The Honorable</p>
          <h1>Cornelius Reginald Hawthorne III</h1>
        </div>
        <div className="judge-nameplate">Presiding</div>
      </section>

      <div className={`courtroom-grid phase-${phaseIndex}`}>
        <EvidenceBoard exhibits={trial.exhibits} visibleCount={visibleExhibits} featured={phaseIndex === 2} />

        <section className="performance-area" aria-live="polite" onClick={handleStageClick}>
          <div className="phase-heading">
            <span>Scene {phaseIndex + 1} · Step {stepIndex + 1}</span>
            <h2 className="legal-record-placard">{currentPhase}</h2>
          </div>

          <div className="playback-controls" onClick={(event) => event.stopPropagation()}>
            <button type="button" aria-pressed={autoPlay} onClick={() => setAutoPlay((current) => !current)}>
              Auto-play {autoPlay ? "On" : "Off"}
            </button>
            <div className="speed-control" aria-label="Text speed">
              <span>Speed</span>
              {(["slow", "normal", "fast"] as TextSpeed[]).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  aria-pressed={textSpeed === speed}
                  onClick={() => setTextSpeed(speed)}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${phaseIndex}-${currentStep?.id}`}
              initial={{ opacity: 0, y: 18, scale: 0.994, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="phase-content visual-novel-scene"
            >
              {currentStep?.kind === "dialogue" && (
                <DialogueCard
                  speaker={currentStep.speaker}
                  text={currentStep.text}
                  compact={currentStep.compact}
                  speed={speedValues[textSpeed]}
                  skipSignal={skipSignal}
                  onTypingStart={() => {
                    setIsTyping(true);
                    setLineComplete(false);
                  }}
                  onTypingComplete={() => {
                    setIsTyping(false);
                    setLineComplete(true);
                  }}
                />
              )}

              {currentStep?.kind === "interaction" && (
                <CounselChoicePanel
                  interaction={playerInteractions[currentStep.interactionId]}
                  selected={currentSelection}
                  onSelect={(choice) => chooseInteraction(currentStep.interactionId, choice)}
                />
              )}

              {currentStep?.kind === "jury" && activeJuror && (
                <div className="jury-testimony-scene">
                  <span className="jury-testimony-portrait" aria-hidden="true">{activeJuror.emoji}</span>
                  <p className="jury-testimony-label">Juror {currentStep.jurorIndex + 1} of 12</p>
                  <h3>{activeJuror.name}</h3>
                  <blockquote>
                    <TypewriterText
                      text={activeJuror.line}
                      speed={speedValues[textSpeed]}
                      skipSignal={skipSignal}
                      onStart={() => {
                        setIsTyping(true);
                        setLineComplete(false);
                      }}
                      onComplete={() => {
                        setIsTyping(false);
                        setLineComplete(true);
                      }}
                    />
                  </blockquote>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: lineComplete ? 1 : 0 }} className="jury-testimony-vote">
                    Vote recorded: {activeJuror.vote}
                  </motion.span>
                </div>
              )}

              <div className="scene-advance-area">
                {isTyping && <p>Click the testimony to complete the line.</p>}
                {canContinue && (
                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="button"
                    onClick={advanceStep}
                    className="scene-continue-button"
                  >
                    {isLastStep ? `Proceed to ${sceneLabels[phaseIndex + 1]}` : "Continue"}
                  </motion.button>
                )}
                {autoPlay && lineComplete && currentStep?.kind !== "interaction" && <p>Auto-play will continue shortly.</p>}
              </div>
            </motion.div>
          </AnimatePresence>

          <CourtRecord selections={selections} failedObjections={failedObjections} />
        </section>

        <JuryBox jurors={trial.jury} revealedCount={revealedJurors} featured={phaseIndex === 5} />
      </div>
    </main>
  );
}
