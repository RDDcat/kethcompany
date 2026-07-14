import { hero } from "../lib/content";
import Reveal from "./Reveal";

export default function Mission() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
        <div className="grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] md:gap-16">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
              Our Mission
            </span>
            <p className="mt-4 text-sm font-medium text-muted">
              왜 케쓰가 이 일을 하는가
            </p>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-2xl font-semibold leading-[1.5] tracking-display text-ink md:text-[2.1rem] md:leading-[1.5]">
              {hero.mission}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
