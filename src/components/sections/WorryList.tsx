"use client";

import { useEffect, useState } from "react";
import { Sparkle } from "@/components/brand/Sparkle";
import { prefersReducedMotion, useInView } from "@/lib/useInView";
import "./worry-list.css";

const ITEMS = [
  "reply to 43 unread messages",
  "dinner at 11pm (again)",
  "gym. tomorrow. definitely.",
  "third chai of the day",
  "sleep before 1am",
] as const;
const GUT = "look after your gut";
const ALL = [...ITEMS, GUT];

// Ripple timing in ms; worry-list.css reads the same values from --start/--step.
const NUDGE_START = 200;
const NUDGE_STEP = 90;
const NUDGE_LENGTH = 1200;
// The last box ticks once the ripple has peaked on it, then the strike follows.
const NUDGE_LAND = 220;

export function WorryList() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const [done, setDone] = useState<Set<string>>(new Set());
  const [touched, setTouched] = useState(false);
  const [nudging, setNudging] = useState(false);

  // One ripple runs down the circles ("these are tappable"). When it reaches
  // the bottom, the last item crosses itself off: the one we're here for.
  useEffect(() => {
    if (!inView || touched) return;
    const reduced = prefersReducedMotion();
    const lastAt = reduced ? 0 : NUDGE_START + (ALL.length - 1) * NUDGE_STEP + NUDGE_LAND;
    const timers = [
      setTimeout(() => setNudging(!reduced), 0),
      setTimeout(() => setDone((d) => new Set(d).add(GUT)), lastAt),
      setTimeout(() => setNudging(false), lastAt + NUDGE_LENGTH),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView, touched]);

  function toggle(item: string) {
    setTouched(true);
    setNudging(false);
    setDone((d) => {
      const next = new Set(d);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  const others = ITEMS.filter((i) => done.has(i)).length;
  const note =
    done.size === ALL.length
      ? "all clear. imagine feeling like this every day."
      : done.has(GUT)
        ? others
          ? `${others} down, and the gut one's on us.`
          : "that one's on us. one less thing."
        : others
          ? `${others} down. feels good, right?`
          : "";

  return (
    <div
      ref={ref}
      className={`w-full ${nudging ? "wl-nudging" : ""}`}
      style={{ "--start": `${NUDGE_START}ms`, "--step": `${NUDGE_STEP}ms` } as React.CSSProperties}
    >
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="flex items-center gap-2 text-base font-medium text-ink">
          <Sparkle className="size-4 text-orange" />
          tap to cross things off
        </p>
        <p className="text-sm text-ink/60 tabular-nums" aria-live="polite">
          {done.size} of {ALL.length} done
        </p>
      </div>

      <ul className="flex flex-col gap-1">
        {ALL.map((item, i) => {
          const checked = done.has(item);
          return (
            <li key={item}>
              <button
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(item)}
                className="group -mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center gap-4 rounded-2xl px-3 py-3 text-left transition-[background-color,scale] duration-200 hover:bg-white/80 active:scale-[0.98] md:py-4"
              >
                <span
                  aria-hidden="true"
                  className={`wl-circle relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,border-color] duration-300 ${
                    checked ? "border-orange bg-orange" : "border-ink/35 bg-white group-hover:border-orange"
                  }`}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className={`size-4 transition-[opacity,scale,color] duration-300 ${
                      checked
                        ? "scale-100 text-ink opacity-100"
                        : "scale-75 text-orange opacity-0 group-hover:scale-100 group-hover:opacity-60"
                    }`}
                  >
                    <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span
                  className={`relative font-display text-lg leading-tight font-extrabold tracking-tight transition-colors duration-500 md:text-2xl ${
                    checked ? "text-ink/35" : "text-ink"
                  }`}
                >
                  {item}
                  {/* The strike draws itself left to right */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-1/2 left-0 h-[3px] w-full origin-left -translate-y-1/2 rounded-full bg-orange transition-transform ${
                      checked
                        ? "scale-x-100 delay-150 duration-[380ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
                        : "scale-x-0 duration-200 ease-out"
                    }`}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="mt-4 min-h-6 text-base text-ink/70">
        {note}
      </p>
    </div>
  );
}
