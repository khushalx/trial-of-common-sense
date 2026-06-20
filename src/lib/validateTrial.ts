import { getFallbackTrial } from "@/lib/fallbackTrial";
import type { TrialScript } from "@/lib/trialTypes";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateTrial(value: unknown): value is TrialScript {
  const failures: string[] = [];

  if (!isRecord(value)) {
    console.warn("[trial-validation] Trial output is missing or is not an object.");
    return false;
  }

  const requireString = (candidate: unknown, path: string) => {
    if (!hasString(candidate)) failures.push(`${path} must be a non-empty string`);
  };

  requireString(value.topic, "topic");
  requireString(value.caseNumber, "caseNumber");
  requireString(value.mispronouncedTopic, "mispronouncedTopic");
  requireString(value.judgeOpening, "judgeOpening");

  if (!isRecord(value.openingStatements)) failures.push("openingStatements is missing");
  else {
    requireString(value.openingStatements.internet, "openingStatements.internet");
    requireString(value.openingStatements.gerald, "openingStatements.gerald");
  }

  if (!Array.isArray(value.exhibits) || value.exhibits.length !== 3) {
    failures.push("exhibits must contain exactly 3 items");
  } else {
    value.exhibits.forEach((exhibit, index) => {
      if (!isRecord(exhibit)) {
        failures.push(`exhibits[${index}] is invalid`);
        return;
      }
      ["label", "title", "description", "judgeReaction", "geraldObjection", "judgeOverrule"].forEach((field) => {
        requireString(exhibit[field], `exhibits[${index}].${field}`);
      });
    });
  }

  const crossExamination = value.crossExamination;
  if (!isRecord(crossExamination)) failures.push("crossExamination is missing");
  else {
    ["geraldQuestion", "internetAnswer", "judgeConfusion", "geraldGivesUp"].forEach((field) => {
      requireString(crossExamination[field], `crossExamination.${field}`);
    });
  }

  if (!isRecord(value.closingArguments)) failures.push("closingArguments is missing");
  else {
    requireString(value.closingArguments.gerald, "closingArguments.gerald");
    requireString(value.closingArguments.internet, "closingArguments.internet");
  }

  if (!Array.isArray(value.jury) || value.jury.length !== 12) {
    failures.push("jury must contain exactly 12 items");
  } else {
    value.jury.forEach((juror, index) => {
      if (!isRecord(juror)) {
        failures.push(`jury[${index}] is invalid`);
        return;
      }
      requireString(juror.name, `jury[${index}].name`);
      requireString(juror.emoji, `jury[${index}].emoji`);
      requireString(juror.line, `jury[${index}].line`);
      if (juror.vote !== "GUILTY") failures.push(`jury[${index}].vote must be GUILTY`);
    });
  }

  if (!isRecord(value.verdict)) failures.push("verdict is missing");
  else {
    if (value.verdict.status !== "GUILTY") failures.push("verdict.status must be GUILTY");
    requireString(value.verdict.pauseText, "verdict.pauseText");
    requireString(value.verdict.sentencing, "verdict.sentencing");
    requireString(value.verdict.shareText, "verdict.shareText");
  }

  if (failures.length > 0) {
    console.warn("[trial-validation] Invalid trial output; archived proceedings will be used.", failures);
    return false;
  }

  return true;
}

export function validateTrialOrFallback(value: unknown, userTopic: string): TrialScript {
  if (!validateTrial(value)) return getFallbackTrial(userTopic);
  return { ...value, topic: userTopic || value.topic };
}
