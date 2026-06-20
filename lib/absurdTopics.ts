export const absurdTopics = [
  "whether cereal is a soup",
  "putting pineapple on pizza",
  "replying ‘k’ to a paragraph",
  "owning seventeen decorative pillows",
  "wearing socks with sandals",
  "the correct direction for toilet paper",
  "calling a hot dog a sandwich",
  "clapping when the plane lands",
  "reheating fish in the office microwave",
  "using a fork to eat pizza",
  "saving every browser tab forever",
  "arriving at the airport five hours early",
  "putting milk in before the cereal",
  "standing up immediately when a flight lands",
  "voice notes longer than three minutes",
  "books arranged by color instead of author",
  "wearing sunglasses indoors",
  "leaving one second on the microwave",
  "calling instead of texting first",
  "whether the middle seat gets both armrests",
] as const;

export function getRandomAbsurdTopic(current?: string): string {
  const available = absurdTopics.filter((topic) => topic !== current);
  return available[Math.floor(Math.random() * available.length)];
}
