import { valuesBlock } from "../lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Values() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <SectionHeading
          eyebrow="Our Values"
          title="케쓰가 일하는 태도"
          description={valuesBlock.intro}
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {valuesBlock.values.map((v, i) => (
            <Reveal
              key={v.en}
              delay={(i % 2) * 80}
              className="group flex flex-col bg-white p-8 transition-colors hover:bg-surface md:p-10"
            >
              <span className="text-sm font-bold tracking-widest text-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-xl font-bold text-ink md:text-2xl">
                {v.ko}
              </h3>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-subtle">
                {v.en}
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-muted">
                {v.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
