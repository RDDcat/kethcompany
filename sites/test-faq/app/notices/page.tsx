import type { Metadata } from "next";
import Link from "next/link";
import { notices } from "../lib/content";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "Notice",
  description: "케쓰의 채용과 팀에 관한 소식을 전합니다.",
};

export default function NoticesPage() {
  return (
    <>
      <PageHero
        eyebrow="Notice"
        title="공지사항"
        description="케쓰의 채용과 팀에 관한 소식을 이곳에 전합니다."
      />

      <section>
        <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
          <ul className="border-t border-line">
            {notices.map((n, i) => (
              <Reveal key={n.slug} as="li" delay={(i % 4) * 50}>
                <Link
                  href={`/notices/${n.slug}`}
                  className="group flex flex-col gap-3 border-b border-line py-8 transition-colors hover:bg-surface md:flex-row md:items-center md:gap-8 md:px-4"
                >
                  <div className="flex items-center gap-4 md:w-40 md:flex-none">
                    <span className="rounded-full border border-line-strong px-3 py-1 text-xs font-semibold text-muted">
                      {n.category}
                    </span>
                    <time className="text-sm text-subtle">{n.date}</time>
                  </div>
                  <h2 className="flex-1 text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-black md:text-xl">
                    {n.title}
                  </h2>
                  <span className="hidden flex-none text-subtle transition-colors group-hover:text-ink md:block">
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
