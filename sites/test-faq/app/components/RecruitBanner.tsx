import Link from "next/link";
import { hero } from "../lib/content";
import Reveal from "./Reveal";

export default function RecruitBanner() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-line-strong bg-white text-sm font-bold text-ink">
              We
            </span>
            <p className="text-lg font-semibold leading-snug text-ink md:text-xl">
              {hero.recruitBanner}
            </p>
          </div>
          <Link
            href="/faqs"
            className="flex-none text-sm font-semibold text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            채용 절차 살펴보기 →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
