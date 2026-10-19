import { EarlyAccessForm } from "@/components/early-access/EarlyAccessForm";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";
import { HeadlineStage } from "./HeadlineStage";

export function Hero() {
  return (
    <section
      data-snap
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col overflow-hidden bg-lavender"
      style={{
        // Key light from the upper left falling off across a seamless backdrop.
        backgroundImage:
          "radial-gradient(120% 90% at 18% 8%, rgba(255,255,255,0.45), rgba(255,255,255,0) 60%), radial-gradient(80% 60% at 90% 100%, rgba(120,90,170,0.18), rgba(120,90,170,0) 70%)",
      }}
    >
      {/* Lets the studio light fall off to flat lavender so the next section picks up seamlessly. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{ background: "linear-gradient(to bottom, rgba(217,200,240,0), var(--lavender))" }}
      />

      <header className="relative mx-auto flex w-full max-w-[86rem] items-start justify-between gap-6 px-4 pt-6 md:items-center md:px-12 md:pt-8">
        <a href="#top" aria-label="One Less Thing, back to top" className="group">
          <Logo className="h-9 w-auto text-ink md:h-11" />
        </a>
        <p className="max-w-36 text-right text-sm leading-5 text-ink/70 md:max-w-none">{site.launchLine}</p>
      </header>

      <div className="relative mx-auto flex w-full max-w-[86rem] flex-1 flex-col justify-end px-4 pt-12 pb-10 md:justify-center md:px-12 md:pt-8 md:pb-16">
        <HeadlineStage />

        <div className="flex max-w-md flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-3">
            <p className="font-display text-xl font-extrabold tracking-tight md:text-2xl">
              daily gut care, made simple.
            </p>
            <p className="text-lg leading-7 text-ink/80">
              we&apos;re creating a daily fibre supplement that fits into your water and your life.
            </p>
          </div>
          <EarlyAccessForm source="hero" />
        </div>
      </div>
    </section>
  );
}
