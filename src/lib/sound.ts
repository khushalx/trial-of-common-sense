type SoundName =
  | "gavel-1"
  | "gavel-2"
  | "paper"
  | "wood-knock"
  | "courtroom-roomtone"
  | "verdict-rumble"
  | "verdict-impact"
  | "stamp";

const soundFiles: Record<SoundName, string> = {
  "gavel-1": "/sounds/gavel-1.mp3",
  "gavel-2": "/sounds/gavel-2.mp3",
  paper: "/sounds/paper.mp3",
  "wood-knock": "/sounds/wood-knock.mp3",
  "courtroom-roomtone": "/sounds/courtroom-roomtone.mp3",
  "verdict-rumble": "/sounds/verdict-rumble.mp3",
  "verdict-impact": "/sounds/verdict-impact.mp3",
  stamp: "/sounds/stamp.mp3",
};

const soundVolumes: Record<SoundName, number> = {
  "gavel-1": 0.3,
  "gavel-2": 0.26,
  paper: 0.12,
  "wood-knock": 0.13,
  "courtroom-roomtone": 0.025,
  "verdict-rumble": 0.075,
  "verdict-impact": 0.34,
  stamp: 0.13,
};

let ambience: HTMLAudioElement | null = null;
let verdictRumble: HTMLAudioElement | null = null;
let ambienceRequested = false;
let verdictRumbleRequested = false;
let gavelIndex = 0;
let availableSoundsPromise: Promise<Set<string>> | null = null;

function getAvailableSounds() {
  if (availableSoundsPromise) return availableSoundsPromise;
  if (typeof window === "undefined") return Promise.resolve(new Set<string>());

  availableSoundsPromise = fetch("/sounds/manifest.json")
    .then(async (response) => {
      if (!response.ok) return new Set<string>();
      const manifest = await response.json() as { files?: string[] };
      return new Set(manifest.files ?? []);
    })
    .catch(() => new Set<string>());
  return availableSoundsPromise;
}

export async function getSoundAvailability() {
  return (await getAvailableSounds()).size > 0;
}

function createAudio(name: SoundName, loop = false) {
  if (typeof window === "undefined") return null;

  try {
    const audio = new Audio(soundFiles[name]);
    audio.volume = soundVolumes[name];
    audio.loop = loop;
    audio.preload = "auto";
    return audio;
  } catch {
    return null;
  }
}

async function playOneShot(name: SoundName, volumeMultiplier = 1) {
  const availableSounds = await getAvailableSounds();
  if (!availableSounds.has(soundFiles[name].replace("/sounds/", ""))) return;
  const audio = createAudio(name);
  if (!audio) return;

  audio.volume = Math.min(1, soundVolumes[name] * volumeMultiplier);
  void audio.play().catch(() => {
    // Missing files and autoplay restrictions are intentionally silent.
  });
}

export async function unlockAudio() {
  // Audio is started only from user-enabled playback. Local file playback may
  // still be blocked or unavailable, and every caller already fails silently.
  if (typeof window === "undefined") return false;
  await getAvailableSounds();
  return true;
}

export function playGavel() {
  void playOneShot(gavelIndex % 2 === 0 ? "gavel-1" : "gavel-2");
  gavelIndex += 1;
}

export function playPaper() {
  void playOneShot("paper");
}

export function playWoodKnock(soft = false) {
  void playOneShot("wood-knock", soft ? 0.68 : 1);
}

export function playVerdictImpact() {
  void playOneShot("verdict-impact");
}

export function playStamp() {
  void playOneShot("stamp");
}

export function startAmbience() {
  if (ambience) return;
  ambienceRequested = true;
  void getAvailableSounds().then((availableSounds) => {
    if (!ambienceRequested || ambience || !availableSounds.has("courtroom-roomtone.mp3")) return;
    ambience = createAudio("courtroom-roomtone", true);
    if (!ambience) return;
    void ambience.play().catch(() => {
      ambience = null;
    });
  });
}

export function stopAmbience() {
  ambienceRequested = false;
  if (!ambience) return;
  ambience.pause();
  ambience.currentTime = 0;
  ambience = null;
}

export function startVerdictRumble() {
  if (verdictRumble) return;
  verdictRumbleRequested = true;
  void getAvailableSounds().then((availableSounds) => {
    if (!verdictRumbleRequested || verdictRumble || !availableSounds.has("verdict-rumble.mp3")) return;
    verdictRumble = createAudio("verdict-rumble", true);
    if (!verdictRumble) return;
    void verdictRumble.play().catch(() => {
      verdictRumble = null;
    });
  });
}

export function stopVerdictRumble() {
  verdictRumbleRequested = false;
  if (!verdictRumble) return;
  verdictRumble.pause();
  verdictRumble.currentTime = 0;
  verdictRumble = null;
}

export function stopAllSound() {
  stopAmbience();
  stopVerdictRumble();
}
