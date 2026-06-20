"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
  skipSignal?: number;
  onStart?: () => void;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 24,
  delay = 180,
  className = "",
  cursor = true,
  skipSignal = 0,
  onStart,
  onComplete,
}: TypewriterTextProps) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const completedRef = useRef(false);
  const lastSkipSignalRef = useRef(skipSignal);
  const speedRef = useRef(speed);
  const onStartRef = useRef(onStart);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onStartRef.current = onStart;
    onCompleteRef.current = onComplete;
  }, [onComplete, onStart]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    setVisibleCharacters(0);
    completedRef.current = false;
    onStartRef.current?.();
    let timer: number | undefined;

    const typeNextCharacter = () => {
      setVisibleCharacters((current) => {
        const next = Math.min(current + 1, text.length);
        if (next < text.length) timer = window.setTimeout(typeNextCharacter, speedRef.current);
        return next;
      });
    };

    const start = window.setTimeout(() => {
      timer = window.setTimeout(typeNextCharacter, speedRef.current);
    }, delay);

    return () => {
      window.clearTimeout(start);
      if (timer) window.clearTimeout(timer);
    };
  }, [delay, text]);

  useEffect(() => {
    if (skipSignal !== lastSkipSignalRef.current && visibleCharacters < text.length) {
      lastSkipSignalRef.current = skipSignal;
      setVisibleCharacters(text.length);
    }
  }, [skipSignal, text.length, visibleCharacters]);

  useEffect(() => {
    if (visibleCharacters >= text.length && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [text.length, visibleCharacters]);

  const isTyping = visibleCharacters < text.length;

  return (
    <span className={className}>
      {text.slice(0, visibleCharacters)}
      {cursor && isTyping && <span className="typewriter-cursor" aria-hidden="true" />}
    </span>
  );
}
