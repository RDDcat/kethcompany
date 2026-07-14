import Link from "next/link";
import { benefitsBlock } from "../lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Benefits() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Work & Life"
            title="몰입과 회복, 둘 다"
            description={benefitsBlock.intro}
          />
          <Link
            href="/benefits"
            className="flex-none text-sm font-semibold text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            복지 전체 보기 →
          </Link>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {benefitsBlock.categories.map((c, i) => (
            <Reveal
              key={c.key}
              delay={(i % 2) * 80}
              className="flex flex-col rounded-2xl border border-line bg-white p-8 transition-colors hover:border-ink-soft md:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-subtle">
                  {c.key}
                </span>
                <span className="text-xs font-semibold text-subtle">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-display text-ink">
                {c.title}
              </h3>
              <p className="mt-2 text-[15px] text-muted">{c.summary}</p>
              <ul className="mt-6 flex flex-col gap-2.5 border-t border-line pt-6">
                {c.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[15px] text-ink"
                  >
                    <span className="mt-2 h-1 w-1 flex-none rounded-full bg-ink" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
