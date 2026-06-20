"use client";

import { useCallback, useEffect, useState } from "react";
import { stopAllSound, unlockAudio } from "@/src/lib/sound";

const SOUND_PREFERENCE_KEY = "trial-of-common-sense:sound";
const SOUND_CHANGE_EVENT = "trial-sound-preference-change";

export function useSoundPreference() {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const readPreference = () => {
      try {
        setSoundEnabled(window.localStorage.getItem(SOUND_PREFERENCE_KEY) === "on");
      } catch {
        setSoundEnabled(false);
      }
    };

    readPreference();
    window.addEventListener("storage", readPreference);
    window.addEventListener(SOUND_CHANGE_EVENT, readPreference);
    return () => {
      window.removeEventListener("storage", readPreference);
      window.removeEventListener(SOUND_CHANGE_EVENT, readPreference);
    };
  }, []);

  const toggleSound = useCallback(async () => {
    const nextValue = !soundEnabled;

    if (nextValue) await unlockAudio();
    else stopAllSound();

    setSoundEnabled(nextValue);
    try {
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, nextValue ? "on" : "off");
      window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
    } catch {
      // Sound remains usable for the current page even if storage is unavailable.
    }
  }, [soundEnabled]);

  return { soundEnabled, toggleSound };
}
