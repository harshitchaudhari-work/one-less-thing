"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/useInView";
import { headlineGap } from "@/lib/type";

type Pt = [number, number];

// Both shapes share one structure (M + 5 cubic segments) so they can be blended.
const KNOTTED: Pt[] = [
  [-40, 230],
  [220, 230], [400, -10], [250, 130],
  [110, 260], [520, 340], [560, 190],
  [600, 50], [330, 110], [580, 250],
  [770, 370], [930, 40], [1010, 190],
  [1090, 330], [1380, 170], [1480, 190],
];
const FLOWING: Pt[] = [
  [-40, 220],
  [120, 220], [160, 110], [300, 110],
  [440, 110], [460, 260], [600, 260],
  [740, 260], [760, 130], [900, 130],
  [1040, 130], [1060, 250], [1200, 250],
  [1340, 250], [1380, 190], [1480, 190],
];

const CAPSULES = 13;
const SPEED = 70; // drawing units per second at full flow
const SAMPLES_PER_SEGMENT = 40;
// Many faint, nested strokes add up to a soft falloff, like a blur but cheap to redraw.
const SHADOW_WIDTHS = Array.from({ length: 10 }, (_, i) => 136 - i * 9);

function pointsFor(t: number): Pt[] {
  return KNOTTED.map(([x, y], i) => {
    const [fx, fy] = FLOWING[i];
    return [x + (fx - x) * t, y + (fy - y) * t];
  });
}

function pathFor(p: Pt[]) {
  const f = (q: Pt) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  let d = `M ${f(p[0])}`;
  for (let i = 1; i < p.length; i += 3) d += ` C ${f(p[i])}, ${f(p[i + 1])}, ${f(p[i + 2])}`;
  return d;
}

/**
 * Samples the curve into a polyline with running lengths, so capsules can be
 * placed along it in plain JS instead of asking the SVG DOM every frame.
 */
function sample(p: Pt[]) {
  const xs: number[] = [];
  const ys: number[] = [];
  const lens: number[] = [];
  let total = 0;
  for (let s = 0; s + 3 < p.length; s += 3) {
    const [a, b, c, d] = [p[s], p[s + 1], p[s + 2], p[s + 3]];
    for (let k = s === 0 ? 0 : 1; k <= SAMPLES_PER_SEGMENT; k++) {
      const u = k / SAMPLES_PER_SEGMENT;
      const v = 1 - u;
      const x = v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0];
      const y = v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1];
      if (xs.length) total += Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]);
      xs.push(x);
      ys.push(y);
      lens.push(total);
    }
  }
  return { xs, ys, lens, total };
}

type Sampled = ReturnType<typeof sample>;

function at({ xs, ys, lens }: Sampled, dist: number) {
  let lo = 0;
  let hi = lens.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lens[mid] < dist) lo = mid;
    else hi = mid;
  }
  const span = lens[hi] - lens[lo] || 1;
  const f = (dist - lens[lo]) / span;
  const dx = xs[hi] - xs[lo];
  const dy = ys[hi] - ys[lo];
  return { x: xs[lo] + dx * f, y: ys[lo] + dy * f, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

const ease = (t: number) => t * t * (3 - 2 * t);

export function FlowBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const tubeRef = useRef<SVGPathElement>(null);
  const capsuleRefs = useRef<(SVGGElement | null)[]>([]);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const tube = tubeRef.current;
    if (!section || !tube) return;

    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = performance.now();
    let phase = 0;
    let visible = false;
    let progress = reduced ? 1 : 0; // eased towards the scroll position
    let drawn = -1; // the shape currently in the DOM
    let curve = sample(pointsFor(0));

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // 0 while the band is entering from below, 1 once it's comfortably on screen.
      const rect = section!.getBoundingClientRect();
      const vh = window.innerHeight;
      const target = reduced ? 1 : Math.min(1, Math.max(0, 1 - (rect.top + rect.height * 0.5 - vh * 0.4) / (vh * 0.55)));
      // Follow the scroll with a little lag so wheel steps glide instead of jumping.
      progress += (target - progress) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - progress) < 0.0005) progress = target;
      const t = ease(progress);

      // Re-shape the tube only while it's actually changing. Every layer <use>s
      // this one path, so a single attribute write updates them all.
      if (Math.abs(t - drawn) > 0.0004) {
        const pts = pointsFor(t);
        tube!.setAttribute("d", pathFor(pts));
        curve = sample(pts);
        drawn = t;

        if (subRef.current) {
          const s = Math.min(1, Math.max(0, (t - 0.55) / 0.35));
          subRef.current.style.opacity = String(s);
          subRef.current.style.transform = `translateY(${(1 - s) * 8}px)`;
        }
      }

      if (!reduced) phase += SPEED * t * dt;

      const length = curve.total;
      capsuleRefs.current.forEach((el, i) => {
        if (!el) return;
        const jammed = length * 0.2 + i * 43; // bunched up behind the first knot
        const spread = (i * length) / CAPSULES;
        const dist = (((jammed + (spread - jammed) * t + phase) % length) + length) % length;
        const p = at(curve, dist);
        el.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.angle.toFixed(1)})`);
      });

      if (visible && !reduced) raf = requestAnimationFrame(frame);
    }

    // Start a little before the band scrolls into view so it's already moving.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        last = performance.now();
        raf = requestAnimationFrame(frame);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const initial = pathFor(pointsFor(0));

  return (
    <section
      data-snap
      ref={sectionRef}
      aria-labelledby="flow-title"
      // Above the next section and clipped only at the sides, so the tube's
      // shadow can fall softly across the boundary.
      className="relative z-10 overflow-x-clip pt-8 pb-4 md:pb-8"
      style={{ background: "linear-gradient(to bottom, var(--off-white), var(--lavender-light))" }}
    >
      <div className="flex flex-col items-center px-4 text-center">
        <h2
          id="flow-title"
          className={`${headlineGap} font-display text-[11vw] leading-[0.92] font-extrabold tracking-[-0.03em] md:text-[6vw] xl:text-[88px]`}
        >
          your digestion has <br />
          enough going on.
        </h2>
        <p ref={subRef} className="text-lg text-ink/75 md:text-xl" style={{ opacity: 0 }}>
          time to make things flow a little better.
        </p>
      </div>

      <svg
        viewBox="0 0 1440 360"
        preserveAspectRatio="xMidYMid slice"
        overflow="visible"
        className="mt-4 h-64 w-full md:mt-6 md:h-[clamp(240px,26vw,380px)]"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <path id="flow-tube" ref={tubeRef} d={initial} />
          <linearGradient id="capsule-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffa166" />
            <stop offset="0.55" stopColor="#ff792d" />
            <stop offset="1" stopColor="#d9561a" />
          </linearGradient>
        </defs>

        <g fill="none" strokeLinecap="round">
          {/* Soft floor shadow: stacked strokes instead of a blur filter, so it's cheap to redraw */}
          <g transform="translate(0 44)" stroke="#4a3470">
            {SHADOW_WIDTHS.map((w) => (
              <use key={w} href="#flow-tube" strokeWidth={w} strokeOpacity="0.011" />
            ))}
          </g>

          {/* Glass wall: a darker rim, a pale body, a clearer core */}
          <use href="#flow-tube" stroke="#a58bd0" strokeOpacity="0.6" strokeWidth="72" />
          <use href="#flow-tube" stroke="#efe6fa" strokeOpacity="0.8" strokeWidth="64" />
          <use href="#flow-tube" stroke="#fff" strokeOpacity="0.35" strokeWidth="40" />
        </g>

        {Array.from({ length: CAPSULES }, (_, i) => (
          <g key={i} ref={(el) => { capsuleRefs.current[i] = el; }}>
            <rect x="-21" y="-15" width="42" height="30" rx="15" fill="url(#capsule-fill)" />
            <rect x="-13" y="-10" width="20" height="6" rx="3" fill="#fff" opacity="0.5" />
          </g>
        ))}

        {/* Front glass: a faint wash, a bright top highlight, a soft lower reflection */}
        <g fill="none" stroke="#fff" strokeLinecap="round">
          <use href="#flow-tube" strokeOpacity="0.14" strokeWidth="64" />
          <use href="#flow-tube" transform="translate(-3 -21)" strokeOpacity="0.9" strokeWidth="5" />
          <use href="#flow-tube" transform="translate(3 22)" strokeOpacity="0.45" strokeWidth="3" />
        </g>
      </svg>
    </section>
  );
}
