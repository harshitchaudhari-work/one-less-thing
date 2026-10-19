"use client";

import { useEffect, useState } from "react";

/**
 * A small nudge that only shows between the two forms: hidden at the top,
 * hidden whenever a form is on screen, never repeated after signup.
 */
export function FloatingCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const forms = Array.from(document.querySelectorAll("[data-signup]"));
    const visible = new Set<Element>();
    let pastHero = false;

    const update = () => setShow(pastHero && visible.size === 0 && !document.querySelector("[data-signed-up]"));

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    });
    forms.forEach((f) => io.observe(f));

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.8;
      update();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function go() {
    const target = document.getElementById("early-access");
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => target?.querySelector<HTMLInputElement>("input[type=email]")?.focus({ preventScroll: true }), 700);
  }

  return (
    <button
      type="button"
      onClick={go}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`fixed right-4 bottom-4 z-50 cursor-pointer rounded-full bg-ink px-5 py-3 text-sm font-semibold text-off-white shadow-[0_8px_24px_-8px_rgba(23,19,29,0.5)] transition-[opacity,translate,background-color] duration-300 hover:bg-orange hover:text-ink md:right-8 md:bottom-8 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      get early access
    </button>
  );
}
