"use client";

import { useEffect, useState } from "react";
import { getSoundAvailability } from "@/src/lib/sound";

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void | Promise<void>;
  className?: string;
}

export default function SoundToggle({ enabled, onToggle, className = "" }: SoundToggleProps) {
  const [soundAvailable, setSoundAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    void getSoundAvailability().then((available) => {
      if (active) setSoundAvailable(available);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => void onToggle()}
      className={`sound-toggle ${enabled && soundAvailable ? "sound-toggle-on" : ""} ${className}`}
      aria-pressed={enabled && soundAvailable}
      aria-label={!soundAvailable ? "Courtroom sound unavailable" : enabled ? "Turn courtroom sound off" : "Turn courtroom sound on"}
      disabled={!soundAvailable}
    >
      <span aria-hidden="true">{enabled && soundAvailable ? "◉" : "○"}</span>
      {soundAvailable ? `Sound ${enabled ? "On" : "Off"}` : "Sound unavailable"}
    </button>
  );
}
