export type Speaker = "judge" | "internet" | "gerald";

export interface TrialExhibit {
  label: string;
  title: string;
  description: string;
  judgeReaction: string;
  geraldObjection: string;
  judgeOverrule: string;
}

export interface TrialJuror {
  name: string;
  emoji: string;
  line: string;
  vote: "GUILTY";
}

export interface TrialScript {
  caseNumber: string;
  topic: string;
  mispronouncedTopic: string;
  judgeOpening: string;
  openingStatements: {
    internet: string;
    gerald: string;
  };
  exhibits: TrialExhibit[];
  crossExamination: {
    geraldQuestion: string;
    internetAnswer: string;
    judgeConfusion: string;
    geraldGivesUp: string;
  };
  closingArguments: {
    gerald: string;
    internet: string;
  };
  jury: TrialJuror[];
  verdict: {
    status: "GUILTY";
    pauseText: string;
    sentencing: string;
    shareText: string;
  };
  isFallback?: boolean;
}

export interface TrialGenerationResponse {
  trial: TrialScript;
}

export type TrialPhase =
  | "ORDER"
  | "OPENING STATEMENTS"
  | "EXHIBITS"
  | "CROSS-EXAMINATION"
  | "CLOSING ARGUMENTS"
  | "JURY DELIBERATION"
  | "VERDICT";
