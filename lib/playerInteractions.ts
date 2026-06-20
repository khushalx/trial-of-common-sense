export type InteractionId = "advice" | "objection" | "followUp" | "appeal" | "finalReaction";

export interface CounselChoice {
  label: string;
  reaction: string;
}

export interface PlayerSelections {
  advice?: CounselChoice;
  objection?: CounselChoice;
  followUp?: CounselChoice;
  appeal?: CounselChoice;
  finalReaction?: CounselChoice;
}

export interface InteractionDefinition {
  id: InteractionId;
  recordLabel: string;
  eyebrow: string;
  prompt: string;
  options: CounselChoice[];
}

export const playerInteractions: Record<InteractionId, InteractionDefinition> = {
  advice: {
    id: "advice",
    recordLabel: "Player advice",
    eyebrow: "Counsel conference · off the record",
    prompt: "Gerald looks at you with the eyes of a man who has lost this case since 1977. What do you advise?",
    options: [
      { label: "Stay logical.", reaction: "The judge asks whether ‘logical’ is a continental procedure. The Internet posts a laughing reaction. Gerald thanks you with professional sadness." },
      { label: "Appeal to basic human decency.", reaction: "The judge orders the clerk to locate this ‘Human Decency’ fellow. The Internet calls it an unverified source. Gerald quietly writes it down anyway." },
      { label: "Use one meme as evidence.", reaction: "The Internet objects to cultural appropriation. The judge requests that the painted jest be framed. Gerald sighs, but admits it may be your best idea." },
      { label: "Request a mistrial immediately.", reaction: "The judge hears ‘mystery trial’ and praises your sense of occasion. The Internet demands a trailer. Gerald thanks you for trying early." },
    ],
  },
  objection: {
    id: "objection",
    recordLabel: "Failed objection",
    eyebrow: "Associate counsel · objection form 8B",
    prompt: "The screenshot is now somehow evidence. On what grounds do you object?",
    options: [
      { label: "Objection: relevance.", reaction: "Gerald rises and says it precisely. Judge Hawthorne rules that relevance is ‘a modern affectation’ and overrules you." },
      { label: "Objection: hearsay.", reaction: "The judge asks whether Hearsay is the county where the screenshot was printed. Overruled, pending a map." },
      { label: "Objection: this is literally a screenshot.", reaction: "The judge admires its rectangular certainty. The Internet calls you anti-document. Overruled with enthusiasm." },
      { label: "Objection: my soul hurts.", reaction: "The court records this as a medical complaint and overrules it without prejudice to your remaining soul." },
    ],
  },
  followUp: {
    id: "followUp",
    recordLabel: "Question entered",
    eyebrow: "Cross-examination · suggested follow-up",
    prompt: "Gerald has one question left and no remaining optimism. What should he ask The Internet?",
    options: [
      { label: "Can you define your source?", reaction: "The Internet cites a deleted post quoting a podcast about a different topic. The judge asks where one purchases a source. Gerald closes his folder." },
      { label: "Can you stop contradicting yourself?", reaction: "The Internet says it has never contradicted itself and that contradiction is essential. The judge finds this balanced. Gerald ages visibly." },
      { label: "Is this just vibes?", reaction: "The Internet enters ‘the general vibe’ into evidence. The judge asks that it remove its hat. Gerald declines further inquiry." },
      { label: "Are we all trapped here?", reaction: "The Internet says yes, then launches a poll. The judge declares the question philosophical and therefore inadmissible. Gerald gives up." },
    ],
  },
  appeal: {
    id: "appeal",
    recordLabel: "Final appeal",
    eyebrow: "Final approach to the jury",
    prompt: "The jury is listening, technically. Make one final appeal on behalf of Common Sense.",
    options: [
      { label: "Use reason.", reaction: "Three jurors nod, then remember which court they are in. The foreperson marks twelve guilty boxes in advance." },
      { label: "Use emotion.", reaction: "A juror sheds one dignified tear and votes guilty for making the room uncomfortable." },
      { label: "Use a pie chart.", reaction: "The jury becomes hungry. The chart is admitted as dessert and your argument is discarded." },
      { label: "Bribe them with snacks.", reaction: "The snacks are accepted into evidence. The bribe is rejected on the narrow ground that they wanted better snacks." },
    ],
  },
  finalReaction: {
    id: "finalReaction",
    recordLabel: "Counsel’s final act",
    eyebrow: "After the sentence · counsel table",
    prompt: "The court has emptied. Gerald remains seated beside one very reasonable brief. What do you do?",
    options: [
      { label: "Pat Gerald on the shoulder.", reaction: "Gerald nods. ‘Good work,’ he says, meaning the opposite but appreciating the company." },
      { label: "File an appeal.", reaction: "Gerald adds it to the cabinet labeled APPEALS, 1977–PRESENT. The cabinet groans." },
      { label: "Blame The Internet.", reaction: "The Internet has already blamed you in a twelve-part thread. Gerald closes his eyes for a long moment." },
      { label: "Quietly leave the courtroom.", reaction: "You and Gerald depart with dignity, which the bailiff records as suspicious behavior." },
    ],
  },
};
