import { WorryList } from "./WorryList";
import { headlineGap } from "@/lib/type";

export function Problem() {
  return (
    <section
      data-snap
      aria-labelledby="problem-title"
      className="relative px-4 pt-24 pb-20 md:px-12 md:pt-36 md:pb-28"
      // Picks up the hero's lavender and settles into off-white.
      style={{ background: "linear-gradient(to bottom, var(--lavender) 0, var(--off-white) 320px)" }}
    >
      <div className="mx-auto flex max-w-7xl flex-col">
        <h2
          id="problem-title"
          className={`${headlineGap} font-display text-[15vw] leading-[0.9] font-extrabold tracking-[-0.03em] md:text-[8vw] xl:text-[112px]`}
        >
          your life is <br />
          already a lot.
        </h2>
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
          <div className="flex max-w-sm flex-col gap-4 text-lg leading-7 text-ink/80">
            <p>late meals. long days. questionable food choices. we get it.</p>
            <p>taking care of your gut shouldn&apos;t feel like another full-time job.</p>
          </div>
          <WorryList />
        </div>
      </div>
    </section>
  );
}
