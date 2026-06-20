import type { TrialJuror, TrialScript } from "./trialTypes";

const fallbackJurors: TrialJuror[] = [
  { name: "A Substitute Teacher", emoji: "🧑‍🏫", line: "I have seen enough disorder for one lifetime.", vote: "GUILTY" },
  { name: "Someone’s Grandmother", emoji: "🧓", line: "In my day, this would have been settled before lunch.", vote: "GUILTY" },
  { name: "A Tired Line Cook", emoji: "🧑‍🍳", line: "The ticket came in. The answer is guilty.", vote: "GUILTY" },
  { name: "An Amateur Detective", emoji: "🕵️", line: "The vibes, regrettably, constitute evidence.", vote: "GUILTY" },
  { name: "A Middle Manager", emoji: "🧑‍💼", line: "I have aligned with the guilty stakeholder.", vote: "GUILTY" },
  { name: "A Person Who Fixes Things", emoji: "🧑‍🔧", line: "Common Sense ignored the manual again.", vote: "GUILTY" },
  { name: "A Muralist", emoji: "🧑‍🎨", line: "The composition demands a guilty verdict.", vote: "GUILTY" },
  { name: "A Former Space Cadet", emoji: "🧑‍🚀", line: "Even from orbit, this looked indefensible.", vote: "GUILTY" },
  { name: "A Suspicious Gardener", emoji: "🧑‍🌾", line: "Nothing sensible grows from this soil.", vote: "GUILTY" },
  { name: "A Man Who Owns a Gavel", emoji: "🧑‍⚖️", line: "I recognize guilt when I bang at it.", vote: "GUILTY" },
  { name: "A Weekend Scientist", emoji: "🧑‍🔬", line: "My sample size is one, and it says guilty.", vote: "GUILTY" },
  { name: "The Jury Foreperson", emoji: "🧙", line: "We found the facts inconvenient and proceeded accordingly.", vote: "GUILTY" },
];

function distortTopic(topic: string): string {
  const words = topic.trim().split(/\s+/);
  if (words.length < 2) return `${topic}-ology`;
  return words
    .map((word, index) => (index % 3 === 1 ? `${word.replace(/[aeiou]$/i, "")}ington` : word))
    .join(" ");
}

export function getFallbackTrial(rawTopic: string): TrialScript {
  const topic = rawTopic.trim() || "whether cereal is a soup";

  return {
    caseNumber: "0047-∞",
    topic,
    mispronouncedTopic: distortTopic(topic),
    judgeOpening: `This court will now hear arguments concerning ${distortTopic(topic)}. The clerk assures me that is approximately how it is pronounced. Common Sense stands accused of interfering with a perfectly avoidable public disagreement.`,
    openingStatements: {
      internet: `Members of the jury: for years, Common Sense has tried to make ${topic} seem simple. Today we will prove—through confidence, repetition, and several cropped screenshots—that simplicity is a dangerous illusion.`,
      gerald: `My name is Gerald Finch. I represent Common Sense. We had prepared a reasonable position on ${topic}, but I understand that may already be grounds for contempt.`,
    },
    exhibits: [
      {
        label: "Exhibit A",
        title: "The Unverified Screenshot",
        description: `A context-free post stating that “everyone agrees” about ${topic}. It has 83,000 likes and no visible author.`,
        judgeReaction: "Eighty-three thousand approvals? I have never received so many, even from Parliament.",
        geraldObjection: "Your Honor, popularity is not evidence.",
        judgeOverrule: "Overruled. The number is exceptionally large and therefore carries excellent posture.",
      },
      {
        label: "Exhibit B",
        title: "The Group Chat Poll",
        description: "Seven respondents selected ‘obviously.’ Two selected ‘it depends’ and were immediately removed from the chat.",
        judgeReaction: "A decisive civic process. Brutal, but admirably swift.",
        geraldObjection: "The dissenting voters were expelled before the result was counted.",
        judgeOverrule: "Then they were plainly unavailable for comment. Proceed.",
      },
      {
        label: "Exhibit C",
        title: "A Twenty-Seven Part Thread",
        description: `A definitive account of ${topic}, written by someone who discovered the subject this morning. Part fourteen is simply a recipe.`,
        judgeReaction: "Twenty-seven parts! Blackstone required only four volumes. This must be more authoritative.",
        geraldObjection: "The author disabled replies and contradicted themselves in part six.",
        judgeOverrule: "A strategic retreat from cross-examination. Overruled.",
      },
    ],
    crossExamination: {
      geraldQuestion: "Is it not true that your entire argument depends on ignoring context, proportion, and the possibility that two things may be true at once?",
      internetAnswer: "That is a malicious misquotation of a screenshot I have already deleted. Also yes, but in a different font.",
      judgeConfusion: "Mr. Internet, where precisely do you keep these fonts? Are they under oath?",
      geraldGivesUp: "No further questions, Your Honor. I would like the record to show that I tried.",
    },
    closingArguments: {
      gerald: "I ask only that you consider context, proportion, and basic human judgment. These are modest requests, though I recognize they have not tested well today.",
      internet: "The facts are nuanced. The discourse is not. Choose the stronger institution. Find Common Sense guilty.",
    },
    jury: fallbackJurors,
    verdict: {
      status: "GUILTY",
      pauseText: "The court has considered the facts and found them insufficiently popular.",
      sentencing: `Common Sense is hereby sentenced to twelve consecutive lifetimes of explaining ${topic} in comment sections, with no possibility of muting notifications. Gerald Finch is released on his own exhaustion.`,
      shareText: `Common Sense was found GUILTY of ${topic} in Case No. 0047-∞. Gerald sends his condolences.`,
    },
    isFallback: true,
  };
}

export const fallbackTrial = getFallbackTrial("whether cereal is a soup");
