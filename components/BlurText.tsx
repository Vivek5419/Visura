"use client";

import { useEffect, useState } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  onAnimationComplete?: () => void;
  className?: string;
}

export default function BlurText({
  text,
  delay = 150,
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
  className,
}: BlurTextProps) {
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    if (animateBy === "words") {
      setSegments(text.split(" "));
    } else {
      setSegments(text.split(""));
    }
  }, [text, animateBy]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    segments.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          const el = document.getElementById(`blur-text-${index}`);
          if (el) {
            el.classList.add("animate-in");
          }
          if (index === segments.length - 1 && onAnimationComplete) {
            onAnimationComplete();
          }
        }, index * delay)
      );
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [segments, delay, onAnimationComplete]);

  return (
    <div className={`blur-text-container ${className}`}>
      {segments.map((segment, i) => (
        <span
          key={i}
          id={`blur-text-${i}`}
          className={`blur-text-segment from-${direction}`}
        >
          {segment}
          {animateBy === "words" && i < segments.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
}
