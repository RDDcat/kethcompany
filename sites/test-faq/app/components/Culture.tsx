"use client";

import Link from "next/link";
import { useRef } from "react";
import { cultureBlock } from "../lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Culture() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 380);
    el.scrollBy({ left: amount * dir, behavior: "smooth" });
  };

  return (
    <section id="culture" className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="People & Culture"
            title="케쓰를 만드는 사람들"
            description={cultureBlock.intro}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="이전"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:bg-ink hover:text-white"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="다음"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:bg-ink hover:text-white"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cultureBlock.stories.map((s) => (
            <Link
              key={s.slug}
              href={`/articles/${s.slug}`}
              className="group flex w-[85vw] max-w-[340px] flex-none snap-start flex-col justify-between rounded-2xl border border-line bg-white p-8 transition-all hover:-translate-y-1 hover:border-ink sm:w-[340px]"
            >
              <div>
                <span className="inline-block rounded-full border border-line-strong px-3 py-1 text-xs font-semibold text-muted">
                  {s.role}
                </span>
                <h3 className="mt-6 text-xl font-bold leading-snug tracking-display text-ink">
                  {s.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">
                  “{s.quote}”
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
                <span className="text-sm font-semibold text-ink">{s.name}</span>
                <span className="text-sm text-subtle transition-colors group-hover:text-ink">
                  이야기 보기 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
