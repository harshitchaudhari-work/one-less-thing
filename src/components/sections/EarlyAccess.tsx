import { EarlyAccessForm } from "@/components/early-access/EarlyAccessForm";
import { Sparkle } from "@/components/brand/Sparkle";
import { site } from "@/lib/site";
import { headlineGap } from "@/lib/type";

export function EarlyAccess() {
  return (
    <section
      data-snap
      id="early-access"
      aria-labelledby="early-access-title"
      className="relative overflow-hidden px-4 pt-24 pb-20 md:px-12 md:pt-36 md:pb-28"
      style={{ background: "linear-gradient(to bottom, var(--lavender-light), var(--lavender) 360px)" }}
    >
      <Sparkle className="ola-spin pointer-events-none absolute top-6 right-4 size-20 text-orange md:top-24 md:right-[6vw] md:size-[22vw] md:max-h-80 md:max-w-80" />

      <div className="relative mx-auto flex max-w-7xl flex-col">
        <h2
          id="early-access-title"
          className={`${headlineGap} font-display text-[19vw] leading-[0.88] font-extrabold tracking-[-0.03em] md:text-[10vw] xl:text-[140px]`}
        >
          one less <br className="md:hidden" />
          thing <br className="hidden md:block" />
          on <br className="md:hidden" />
          your mind.
        </h2>
        <div className="flex max-w-md flex-col gap-8">
          <div className="flex flex-col gap-3 text-lg leading-7 text-ink/80">
            <p>we&apos;re just getting started. be among the first to hear when one less thing launches.</p>
            <p className="text-ink/60">{site.launchLine}.</p>
          </div>
          <EarlyAccessForm source="closing" />
        </div>
      </div>
    </section>
  );
}
