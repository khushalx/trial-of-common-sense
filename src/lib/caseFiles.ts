import type { TrialScript } from "@/lib/trialTypes";

export interface CaseFile {
  id: string;
  topic: string;
  caseNumber: string;
  verdict: "GUILTY";
  shareText: string;
  completedAt: string;
  firstJurors: string[];
  source: "fallback" | "groq";
}

const CASE_FILES_KEY = "trial-of-common-sense:case-files";
const MAX_CASE_FILES = 5;

export function readCaseFiles(): CaseFile[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(CASE_FILES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.slice(0, MAX_CASE_FILES) as CaseFile[] : [];
  } catch {
    return [];
  }
}

export function saveCaseFile(trial: TrialScript) {
  if (typeof window === "undefined") return;

  const completedAt = new Date().toISOString();
  const caseFile: CaseFile = {
    id: `${trial.caseNumber}-${completedAt}`,
    topic: trial.topic,
    caseNumber: trial.caseNumber,
    verdict: "GUILTY",
    shareText: trial.verdict.shareText,
    completedAt,
    firstJurors: trial.jury.slice(0, 3).map((juror) => juror.name),
    source: trial.isFallback ? "fallback" : "groq",
  };

  try {
    const existing = readCaseFiles().filter((item) => item.topic !== trial.topic || item.caseNumber !== trial.caseNumber);
    window.localStorage.setItem(CASE_FILES_KEY, JSON.stringify([caseFile, ...existing].slice(0, MAX_CASE_FILES)));
  } catch {
    // History is optional and must never interrupt a verdict.
  }
}

export function clearCaseFiles() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CASE_FILES_KEY);
  } catch {
    // Storage may be unavailable in private browsing modes.
  }
}
