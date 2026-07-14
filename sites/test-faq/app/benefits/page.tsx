import type { Metadata } from "next";
import { benefitsBlock } from "../lib/content";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "Work & Life",
  description:
    "잘 몰입하고, 잘 쉬고, 계속 성장하는 흐름을 팀이 함께 지킵니다. 케쓰의 일과 삶.",
};

export default function BenefitsPage() {
  return (
    <>
      <PageHero
        eyebrow="Work & Life"
        title="일과 삶, 함께 챙깁니다"
        description={benefitsBlock.intro}
      />

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {benefitsBlock.categories.map((c, i) => (
          <section
            key={c.key}
            className="border-b border-line py-20 last:border-b-0 md:py-28"
          >
            <div className="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] md:gap-16">
              <Reveal className="md:sticky md:top-28 md:self-start">
                <span className="text-6xl font-extrabold tracking-display text-line-strong md:text-7xl">
                  0{i + 1}
                </span>
                <h2 className="mt-6 text-2xl font-bold tracking-display text-ink md:text-3xl">
                  {c.title}
                </h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-subtle">
                  {c.key}
                </p>
                <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted">
                  {c.summary}
                </p>
              </Reveal>

              <div className="grid gap-4 sm:grid-cols-2">
                {c.items.map((item, j) => (
                  <Reveal
                    key={item}
                    delay={(j % 2) * 70}
                    className="flex items-start gap-4 rounded-2xl border border-line bg-white p-6 transition-colors hover:border-ink-soft"
                  >
                    <span className="mt-0.5 text-sm font-bold text-subtle">
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[15px] leading-relaxed text-ink">
                      {item}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
