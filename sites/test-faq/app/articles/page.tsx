import type { Metadata } from "next";
import Link from "next/link";
import { cultureBlock } from "../lib/content";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "People & Culture",
  description:
    "직무도 배경도 다르지만 같은 문제를 바라보는 사람들. 케쓰를 만드는 사람들의 이야기입니다.",
};

export default function ArticlesPage() {
  return (
    <>
      <PageHero
        eyebrow="People & Culture"
        title="케쓰를 만드는 사람들"
        description={cultureBlock.intro}
      />

      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cultureBlock.stories.map((s, i) => (
              <Reveal
                key={s.slug}
                delay={(i % 3) * 70}
                as="article"
                className="h-full"
              >
                <Link
                  href={`/articles/${s.slug}`}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-white p-8 transition-all hover:-translate-y-1 hover:border-ink"
                >
                  <div>
                    <span className="inline-block rounded-full border border-line-strong px-3 py-1 text-xs font-semibold text-muted">
                      {s.role}
                    </span>
                    <h2 className="mt-6 text-xl font-bold leading-snug tracking-display text-ink">
                      {s.title}
                    </h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-muted">
                      “{s.quote}”
                    </p>
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
                    <span className="text-sm font-semibold text-ink">
                      {s.name}
                    </span>
                    <span className="text-sm text-subtle transition-colors group-hover:text-ink">
                      이야기 보기 →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
