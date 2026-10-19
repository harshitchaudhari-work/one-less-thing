"use client";

import Link from "next/link";
import { Sparkle } from "@/components/brand/Sparkle";
import { useId, useState, type FormEvent } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function EarlyAccessForm({ source }: { source: "hero" | "closing" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  // Marketing is opt-in: unticked unless they choose it.
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    const company = new FormData(event.currentTarget).get("company") ?? "";

    if (!EMAIL_PATTERN.test(value)) {
      setStatus({ kind: "error", message: "that email doesn't look quite right. try name@example.com." });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source, marketingConsent, company }),
      });
      const data: { message?: string } = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus({ kind: "success", message: data.message ?? "you're on the list. one less thing to remember." });
        setEmail("");
      } else {
        setStatus({
          kind: "error",
          message: data.message ?? "we couldn't add you just now. try again in a minute.",
        });
      }
    } catch {
      setStatus({ kind: "error", message: "couldn't reach us. check your connection and try again." });
    }
  }

  if (status.kind === "success") {
    return (
      <div data-signup data-signed-up role="status" className="flex items-center gap-3">
        <Sparkle className="ola-pop size-8 shrink-0 text-orange" />
        <p className="font-display text-xl font-extrabold tracking-tight md:text-2xl">{status.message}</p>
      </div>
    );
  }

  const loading = status.kind === "loading";
  const hasError = status.kind === "error";

  return (
    <form data-signup onSubmit={onSubmit} noValidate className="w-full max-w-md">
      {/* Honeypot: hidden from people and screen readers; bots tend to fill it in. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${id}-email`} className="sr-only">
            Email address
          </label>
          <input
            id={`${id}-email`}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (hasError) setStatus({ kind: "idle" });
            }}
            aria-invalid={hasError || undefined}
            aria-describedby={`${id}-note ${hasError ? `${id}-error` : ""}`}
            disabled={loading}
            className="h-12 w-full rounded-none border-0 border-b-2 border-ink bg-transparent px-0 text-lg text-ink placeholder:text-ink/45 focus:border-ink focus:outline-none focus-visible:outline-none disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="group/btn inline-flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-orange px-6 text-base font-semibold text-ink transition-[background-color,color,scale] duration-200 hover:bg-ink hover:text-off-white active:scale-[0.97] disabled:cursor-wait disabled:opacity-70 min-[420px]:w-auto"
        >
          <Sparkle
            className={`size-4 transition-[rotate,color] duration-500 group-hover/btn:rotate-180 group-hover/btn:text-orange ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "adding you…" : "get early access"}
        </button>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-5 text-ink/80">
        <input
          type="checkbox"
          name="marketingConsent"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          disabled={loading}
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--orange)]"
        />
        <span>also send me the occasional tip and offer. unsubscribe anytime.</span>
      </label>

      <div className="mt-3 min-h-10 text-sm leading-5">
        {hasError ? (
          <p id={`${id}-error`} role="alert" className="font-medium text-ink">
            {status.message}
          </p>
        ) : (
          <p id={`${id}-note`} className="text-ink/70">
            we&apos;ll email you when we launch. no spam, ever.{" "}
            <Link href="/privacy" className="whitespace-nowrap underline underline-offset-2 hover:text-ink">
              privacy policy
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
