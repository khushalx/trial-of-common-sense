import type { TrialScript } from "./trialTypes";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isTrialScript(value: unknown): value is TrialScript {
  if (!isRecord(value)) return false;

  const opening = value.openingStatements;
  const cross = value.crossExamination;
  const closing = value.closingArguments;
  const verdict = value.verdict;
  const exhibits = value.exhibits;
  const jury = value.jury;

  if (
    !isNonEmptyString(value.caseNumber) ||
    !isNonEmptyString(value.topic) ||
    !isNonEmptyString(value.mispronouncedTopic) ||
    !isNonEmptyString(value.judgeOpening)
  ) return false;

  if (!isRecord(opening) || !isNonEmptyString(opening.internet) || !isNonEmptyString(opening.gerald)) return false;

  if (!Array.isArray(exhibits) || exhibits.length !== 3) return false;
  if (!exhibits.every((exhibit, index) => {
    if (!isRecord(exhibit)) return false;
    return (
      exhibit.label === `Exhibit ${String.fromCharCode(65 + index)}` &&
      isNonEmptyString(exhibit.title) &&
      isNonEmptyString(exhibit.description) &&
      isNonEmptyString(exhibit.judgeReaction) &&
      isNonEmptyString(exhibit.geraldObjection) &&
      isNonEmptyString(exhibit.judgeOverrule)
    );
  })) return false;

  if (
    !isRecord(cross) ||
    !isNonEmptyString(cross.geraldQuestion) ||
    !isNonEmptyString(cross.internetAnswer) ||
    !isNonEmptyString(cross.judgeConfusion) ||
    !isNonEmptyString(cross.geraldGivesUp)
  ) return false;

  if (!isRecord(closing) || !isNonEmptyString(closing.gerald) || !isNonEmptyString(closing.internet)) return false;

  if (!Array.isArray(jury) || jury.length !== 12) return false;
  if (!jury.every((juror) => (
    isRecord(juror) &&
    isNonEmptyString(juror.name) &&
    isNonEmptyString(juror.emoji) &&
    isNonEmptyString(juror.line) &&
    juror.vote === "GUILTY"
  ))) return false;

  return (
    isRecord(verdict) &&
    verdict.status === "GUILTY" &&
    isNonEmptyString(verdict.pauseText) &&
    isNonEmptyString(verdict.sentencing) &&
    isNonEmptyString(verdict.shareText)
  );
}
