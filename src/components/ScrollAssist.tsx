"use client";

import { useEffect } from "react";

/**
 * A gentle nudge, not snap scrolling: when the reader comes to rest just
 * short of the start of a section marked `data-snap`, glide the last few pixels
 * in the direction they were already scrolling so it lines up. It never moves
 * against their direction, and if the nearest section is far away it does
 * nothing. It waits until scrolling (including trackpad momentum) has fully
 * stopped and stayed stopped for a moment, and any new input takes over.
 */
export function ScrollAssist() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hasScrollEnd = "onscrollend" in window;
    let idle = 0;
    let glide = 0;
    let gliding = false;
    let touching = false;
    let lastY = window.scrollY;
    let direction = 0; // 1 down, -1 up

    function stopGlide() {
      if (!gliding) return;
      cancelAnimationFrame(glide);
      gliding = false;
    }

    // Our own easing, so the glide is soft and steady rather than the browser's default.
    function glideBy(distance: number) {
      const from = Math.round(window.scrollY);
      const sign = Math.sign(distance);
      const duration = Math.min(450, 200 + Math.abs(distance) * 2);
      const start = performance.now();
      let at = from;
      gliding = true;
      const step = (now: number) => {
        if (!gliding) return;
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        // Whole pixels, and never a step backwards, so sub-pixel rounding can't wobble.
        const next = Math.round(from + distance * eased);
        if ((next - at) * sign > 0) at = next;
        // "instant" so the page's smooth scroll-behavior doesn't animate each frame again.
        window.scrollTo({ top: at, behavior: "instant" });
        if (p < 1) glide = requestAnimationFrame(step);
        else gliding = false;
      };
      glide = requestAnimationFrame(step);
    }

    function settle() {
      if (touching || gliding) return;
      // Leave the page alone while someone is typing into a field.
      if (document.activeElement instanceof HTMLInputElement) return;

      if (direction === 0) return;
      const reach = Math.min(window.innerHeight * 0.12, 120);
      let nearest: number | null = null;
      for (const el of document.querySelectorAll<HTMLElement>("[data-snap]")) {
        const offset = el.getBoundingClientRect().top;
        // Only sections just ahead in the direction they were scrolling.
        if (Math.sign(offset) === direction && Math.abs(offset) > 1 && Math.abs(offset) <= reach) {
          if (nearest === null || Math.abs(offset) < Math.abs(nearest)) nearest = offset;
        }
      }
      if (nearest !== null) glideBy(nearest);
    }

    function onScroll() {
      if (gliding) return; // our own movement, not the reader's
      const y = window.scrollY;
      if (y !== lastY) direction = y > lastY ? 1 : -1;
      lastY = y;
      // Any movement cancels a pending settle. Where `scrollend` isn't
      // supported, a clear pause stands in for it.
      window.clearTimeout(idle);
      if (!hasScrollEnd) idle = window.setTimeout(settle, 260);
    }

    // A mouse wheel reports "scroll ended" between notches, so also wait for a
    // short quiet moment before treating it as the reader having stopped.
    function onScrollEnd() {
      if (gliding) return;
      lastY = window.scrollY;
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, 180);
    }

    // Any deliberate input hands control straight back to the reader.
    function onInput() {
      stopGlide();
      window.clearTimeout(idle);
    }
    const down = () => {
      touching = true;
      onInput();
    };
    const up = () => {
      touching = false;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    if (hasScrollEnd) window.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("keydown", onInput);
    window.addEventListener("mousedown", onInput);
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchend", up, { passive: true });
    window.addEventListener("touchcancel", up, { passive: true });
    return () => {
      stopGlide();
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("mousedown", onInput);
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
    };
  }, []);

  return null;
}
