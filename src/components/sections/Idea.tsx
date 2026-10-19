import { Sparkle } from "@/components/brand/Sparkle";
import { MixingGlass } from "./MixingGlass";
import { headlineGap } from "@/lib/type";

const BENEFITS = [
  {
    title: "everyday fibre support",
    body: "a daily dose of fibre, without overhauling what's on your plate.",
  },
  {
    title: "just add water",
    body: "stir it into a glass of water. no blender, no recipes, no fuss.",
  },
  {
    title: "made for every day",
    body: "simple enough to actually keep doing. which is kind of the whole point.",
  },
];

export function Idea() {
  return (
    <section data-snap aria-labelledby="idea-title" className="bg-lavender-light px-4 pt-12 pb-24 md:px-12 md:pt-20 md:pb-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 md:gap-20">
        <div className="flex flex-col">
          <h2
            id="idea-title"
            className={`${headlineGap} font-display text-[15vw] leading-[0.9] font-extrabold tracking-[-0.03em] md:text-[7vw] xl:text-[100px]`}
          >
            simple water. <br />
            better for <br className="md:hidden" />
            your gut.
          </h2>
          <p className="max-w-lg text-lg leading-7 text-ink/80">
            we&apos;re working on a daily fibre supplement designed to make gut care easier to fit into your
            routine.
          </p>
        </div>

        <MixingGlass />

        <ul className="grid gap-10 pt-4 md:grid-cols-3 md:gap-12">
          {BENEFITS.map((b) => (
            <li key={b.title} className="group flex flex-col gap-3">
              <Sparkle className="size-6 text-orange transition-transform duration-500 group-hover:rotate-90" />
              <h3 className="font-display text-xl font-extrabold tracking-tight md:text-2xl">{b.title}</h3>
              <p className="max-w-xs text-base leading-6 text-ink/75">{b.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
