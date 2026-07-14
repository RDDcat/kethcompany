import { hero } from "../lib/content";
import Reveal from "./Reveal";

export default function Motto() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
        <Reveal className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Our Motto
          </span>
          <p className="mt-8 max-w-4xl text-4xl font-extrabold leading-[1.15] tracking-display sm:text-6xl md:text-7xl">
            {hero.englishMotto}
          </p>
          <p className="mt-8 text-xl font-semibold text-white/90 md:text-2xl">
            {hero.mottoKo}
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
            {hero.mottoBody}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
