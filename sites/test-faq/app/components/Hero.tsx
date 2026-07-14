import { hero } from "../lib/content";

const KEYWORDS = [
  "AI 상담",
  "프로덕트",
  "빠른 실험",
  "사람 중심",
  "대화 설계",
  "머신러닝",
  "함께 만드는 팀",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* 배경 격자 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-surface blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
        <span className="reveal is-visible inline-flex w-fit items-center gap-2 rounded-full border border-line-strong px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          AI Product Studio · 케쓰
        </span>

        <h1 className="mt-8 max-w-4xl text-[2.6rem] font-extrabold leading-[1.1] tracking-display text-ink sm:text-6xl md:text-[4.7rem]">
          {hero.heroHeadline}
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
          {hero.heroSub}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            현재 개발 중 · AI 상담 서비스
          </span>
          <a
            href="#culture"
            className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            케쓰 사람들 만나보기 ↓
          </a>
        </div>
      </div>

      {/* 하단 키워드 마퀴 */}
      <div className="relative border-t border-line py-5">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...KEYWORDS, ...KEYWORDS].map((kw, i) => (
            <span
              key={i}
              className="text-sm font-medium uppercase tracking-widest text-subtle"
            >
              {kw}
              <span className="ml-10 text-line-strong">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
