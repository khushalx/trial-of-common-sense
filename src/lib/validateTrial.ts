import { getFallbackTrial } from "@/lib/fallbackTrial";
import type { TrialScript } from "@/lib/trialTypes";

type UnknownRecord = Record<string, unknown>;

export type TrialValidationResult =
  | { valid: true; trial: TrialScript }
  | { valid: false; reason: string };

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function usableString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function requiredRuleFailure(value: unknown): string | null {
  if (!isRecord(value)) return "trial object does not exist";

  if (!isRecord(value.verdict)) return "verdict object does not exist";

  if (!Array.isArray(value.exhibits)) return "exhibits is not an array";
  if (value.exhibits.length < 3) return `exhibits has ${value.exhibits.length} items; at least 3 are required`;

  if (!Array.isArray(value.jury)) return "jury is not an array";
  if (value.jury.length < 12) return `jury has ${value.jury.length} items; at least 12 are required`;

  return null;
}

export function normalizeTrial(value: unknown, userTopic: string): TrialValidationResult {
  const failure = requiredRuleFailure(value);
  if (failure) return { valid: false, reason: failure };

  // requiredRuleFailure establishes these shapes before we begin normalizing.
  const source = value as UnknownRecord;
  const sourceVerdict = source.verdict as UnknownRecord;
  const sourceExhibits = source.exhibits as unknown[];
  const sourceJury = source.jury as unknown[];
  const topic = usableString(source.topic, userTopic.trim() || "whether cereal is a soup");
  const fallback = getFallbackTrial(topic);

  const opening = isRecord(source.openingStatements) ? source.openingStatements : {};
  const cross = isRecord(source.crossExamination) ? source.crossExamination : {};
  const closing = isRecord(source.closingArguments) ? source.closingArguments : {};

  const exhibits = sourceExhibits.slice(0, 3).map((item, index) => {
    const exhibit = isRecord(item) ? item : {};
    const archived = fallback.exhibits[index];
    return {
      ...archived,
      ...exhibit,
      label: usableString(exhibit.label, archived.label),
      title: usableString(exhibit.title, archived.title),
      description: usableString(exhibit.description, archived.description),
      judgeReaction: usableString(exhibit.judgeReaction, archived.judgeReaction),
      geraldObjection: usableString(exhibit.geraldObjection, archived.geraldObjection),
      judgeOverrule: usableString(exhibit.judgeOverrule, archived.judgeOverrule),
    };
  });

  const jury = sourceJury.slice(0, 12).map((item, index) => {
    const juror = isRecord(item) ? item : {};
    const archived = fallback.jury[index];
    return {
      ...archived,
      ...juror,
      name: usableString(juror.name, archived.name),
      emoji: usableString(juror.emoji, archived.emoji),
      line: usableString(juror.line, archived.line),
      vote: "GUILTY" as const,
    };
  });

  const caseNumber = usableString(source.caseNumber, fallback.caseNumber);
  const shareText = usableString(
    sourceVerdict.shareText,
    `Common Sense was found GUILTY of ${topic} in Case No. ${caseNumber}. Gerald sends his condolences.`,
  );

  const trial: TrialScript = {
    ...fallback,
    ...source,
    caseNumber,
    topic,
    mispronouncedTopic: usableString(source.mispronouncedTopic, fallback.mispronouncedTopic),
    judgeOpening: usableString(source.judgeOpening, fallback.judgeOpening),
    openingStatements: {
      ...fallback.openingStatements,
      ...opening,
      internet: usableString(opening.internet, fallback.openingStatements.internet),
      gerald: usableString(opening.gerald, fallback.openingStatements.gerald),
    },
    exhibits,
    crossExamination: {
      ...fallback.crossExamination,
      ...cross,
      geraldQuestion: usableString(cross.geraldQuestion, fallback.crossExamination.geraldQuestion),
      internetAnswer: usableString(cross.internetAnswer, fallback.crossExamination.internetAnswer),
      judgeConfusion: usableString(cross.judgeConfusion, fallback.crossExamination.judgeConfusion),
      geraldGivesUp: usableString(cross.geraldGivesUp, fallback.crossExamination.geraldGivesUp),
    },
    closingArguments: {
      ...fallback.closingArguments,
      ...closing,
      gerald: usableString(closing.gerald, fallback.closingArguments.gerald),
      internet: usableString(closing.internet, fallback.closingArguments.internet),
    },
    jury,
    verdict: {
      ...fallback.verdict,
      ...sourceVerdict,
      status: "GUILTY",
      pauseText: usableString(sourceVerdict.pauseText, fallback.verdict.pauseText),
      sentencing: usableString(sourceVerdict.sentencing, fallback.verdict.sentencing),
      shareText,
    },
  };

  return { valid: true, trial };
}

export function validateTrial(value: unknown): value is TrialScript {
  if (!isRecord(value) || requiredRuleFailure(value)) return false;
  const verdict = value.verdict as UnknownRecord;
  const jury = value.jury as unknown[];
  return verdict.status === "GUILTY" && jury.every((juror) => isRecord(juror) && juror.vote === "GUILTY");
}

export function validateTrialOrFallback(value: unknown, userTopic: string): TrialScript {
  const result = normalizeTrial(value, userTopic);
  if (!result.valid) {
    console.warn("Validation failed:", result.reason);
    return getFallbackTrial(userTopic);
  }
  return result.trial;
}
