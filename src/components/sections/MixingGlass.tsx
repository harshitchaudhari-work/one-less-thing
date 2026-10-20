"use client";

import { useEffect, useState } from "react";
import { Glass } from "@/components/hero/Glass";
import { Sparkle } from "@/components/brand/Sparkle";
import { prefersReducedMotion, useInView } from "@/lib/useInView";
import "./mixing-glass.css";

const STEPS = ["add it to water", "stir", "sip"] as const;
// When each step starts, in ms. The last entry is "that's it."
const TIMELINE = [0, 1900, 3500, 4700];

// Fixed scatter so server and client render the same thing. Rounded, because
// Math.sin can differ in the last digits between Node and the browser.
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const r = (n: number) =>
    Math.round((((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1 * 100) / 100;
  return {
    x: 48 + r(1) * 104,
    y: 150 + r(2) * 90,
    size: 3.5 + r(3) * 3,
    fall: 0.55 + r(4) * 0.4, // released while the scoop is tipped
    dissolve: r(5) * 0.7,
  };
});

export function MixingGlass() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.45 });
  const [step, setStep] = useState(-1);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // With reduced motion every step lands at once, leaving the finished glass.
    const reduced = prefersReducedMotion();
    const timers = TIMELINE.map((at, i) => setTimeout(() => setStep(i), reduced ? 0 : at + 200));
    return () => timers.forEach(clearTimeout);
  }, [inView, run]);

  function replay() {
    setStep(-1);
    setRun((n) => n + 1);
  }

  const finished = step === TIMELINE.length - 1;
  const made = finished ? run + 1 : run;

  return (
    // Phones: glass and steps side by side with the button right below, so the
    // whole demo fits on one screen. Wider screens: steps left, glass right.
    <div
      ref={ref}
      className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-6 pt-12 sm:grid-cols-2 sm:gap-x-16 sm:pt-0"
    >
      <div
        className={`mg-stage relative col-start-1 row-start-1 mx-auto w-full sm:col-start-2 sm:row-span-2 sm:w-64 md:w-80 mg-step-${step}`}
        key={run}
      >
        <Glass id="mix-glass" waterClassName="mg-water" mixedClassName="mg-mixed" className="h-auto w-full overflow-visible">
          <g className="mg-swirl">
            {PARTICLES.map((p, i) => (
              <g
                key={i}
                className="mg-dissolve"
                style={{ "--d": `${p.dissolve}s` } as React.CSSProperties}
              >
                <circle
                  className="mg-particle"
                  r={p.size}
                  fill="#ff792d"
                  style={
                    {
                      "--x": `${p.x}px`,
                      "--y": `${p.y}px`,
                      "--delay": `${p.fall}s`,
                    } as React.CSSProperties
                  }
                />
              </g>
            ))}
          </g>
          <Scoop />
        </Glass>
      </div>

      <ol
        className="col-start-2 row-start-1 flex flex-col gap-2 sm:col-start-1 sm:gap-3 sm:self-end"
        aria-label="how it'll work"
      >
          {STEPS.map((label, i) => {
            const active = step === i;
            const past = step > i;
            return (
              <li
                key={label}
                className={`flex items-center gap-2 font-display text-xl font-extrabold tracking-tight transition-colors duration-300 sm:gap-3 sm:text-3xl md:text-5xl ${
                  active ? "text-ink" : past ? "text-ink/55" : "text-ink/25"
                }`}
              >
                <span className="w-4 shrink-0 text-sm font-normal tabular-nums sm:w-6 sm:text-base">{i + 1}</span>
                {label}
                <Sparkle
                  className={`size-4 shrink-0 text-orange sm:size-5 transition-[opacity,rotate] duration-500 ${active ? "rotate-90 opacity-100" : "opacity-0"}`}
                />
              </li>
            );
          })}
      </ol>

      <div className="col-span-2 row-start-2 flex flex-col gap-4 sm:col-span-1 sm:col-start-1 sm:gap-6 sm:self-start">
        <p
          aria-hidden={!finished}
          className={`font-display text-2xl font-extrabold tracking-tight transition-[opacity,translate] duration-500 sm:text-3xl md:text-5xl ${
            finished ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          that&apos;s it. really.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={replay}
            disabled={!finished}
            className="mg-refill group relative h-14 w-fit cursor-pointer overflow-hidden rounded-full border-2 border-ink px-6 font-display text-lg font-extrabold tracking-tight text-ink transition-[color,scale,opacity] duration-300 hover:text-off-white active:scale-[0.96] disabled:cursor-default disabled:opacity-40"
          >
            {/* Water rising from the bottom on hover */}
            <span
              aria-hidden="true"
              className="absolute inset-x-[-10%] top-0 h-[220%] translate-y-full rounded-t-[50%] bg-ink transition-transform duration-500 ease-out group-hover:translate-y-[-30%] group-disabled:translate-y-full"
            />
            <span className="relative flex items-center gap-3">
              <MiniGlass />
              {finished ? "make another glass" : "mixing…"}
            </span>
          </button>

          {made > 0 && (
            <p className="flex items-center gap-2 text-base text-ink/75" aria-live="polite">
              <span
                key={made}
                className="mg-count inline-flex size-8 items-center justify-center rounded-full bg-orange font-display text-sm font-extrabold text-ink tabular-nums"
              >
                {made}
              </span>
              {made === 1 ? "glass down." : made === 2 ? "glasses. getting the hang of it." : "glasses. that's basically a routine."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** A tiny tumbler whose water rises when the button is hovered. */
function MiniGlass() {
  return (
    <svg viewBox="0 0 20 24" className="h-6 w-5 shrink-0" aria-hidden="true" focusable="false">
      <clipPath id="mini-glass-inside">
        <path d="M3.4 3h13.2l-1.6 18H5z" />
      </clipPath>
      <g clipPath="url(#mini-glass-inside)">
        <rect
          x="0"
          y="12"
          width="20"
          height="14"
          className="fill-orange transition-transform duration-500 ease-out group-hover:-translate-y-[5px]"
        />
      </g>
      <path d="M2 2h16l-2 20H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A plain measuring scoop, side on. It swings in, tips its heap of fibre over
 * the glass and lifts away. Drawn around the bowl's centre so it tilts there.
 */
function Scoop() {
  return (
    <g transform="translate(150 -34)">
      <g className="mg-scoop">
        <defs>
          <linearGradient id="scoop-body" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e6dcf3" />
          </linearGradient>
        </defs>
        {/* Handle */}
        <path d="M18 -6 L74 -34" stroke="#cdbfe4" strokeWidth="9" strokeLinecap="round" />
        <path d="M18 -6 L74 -34" stroke="url(#scoop-body)" strokeWidth="6.5" strokeLinecap="round" />
        {/* Heap of fibre, poured out as the scoop tips */}
        <path className="mg-heap" d="M-19 -6 Q-12 -19 0 -20 Q12 -19 19 -6 Z" fill="#ff792d" />
        {/* Bowl */}
        <path d="M-23 -6 Q-23 19 0 19 Q23 19 23 -6 Z" fill="url(#scoop-body)" stroke="#cdbfe4" strokeWidth="1.2" />
        <ellipse cx="0" cy="-6" rx="23" ry="4.5" fill="none" stroke="#cdbfe4" strokeWidth="1.2" />
        <path d="M-16 2 Q-15 12 -6 15" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      </g>
    </g>
  );
}
