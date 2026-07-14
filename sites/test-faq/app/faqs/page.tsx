import type { Metadata } from "next";
import { processFaqBlock } from "../lib/content";
import PageHero from "../components/PageHero";
import ProcessSteps from "../components/ProcessSteps";
import FaqAccordion from "../components/FaqAccordion";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "Process & FAQ",
  description:
    "지원부터 합류까지, 케쓰의 채용 절차와 자주 묻는 질문을 정리했습니다.",
};

export default function FaqsPage() {
  return (
    <>
      <PageHero
        eyebrow="Process & FAQ"
        title="채용 절차와 자주 묻는 질문"
        description={processFaqBlock.processIntro}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
              Recruitment Process
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-display text-ink md:text-3xl">
              합류까지 다섯 단계
            </h2>
          </Reveal>
          <div className="mt-12">
            <ProcessSteps steps={processFaqBlock.steps} />
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
              FAQ
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-display text-ink md:text-3xl">
              자주 묻는 질문
            </h2>
          </Reveal>
          <div className="mt-10">
            <FaqAccordion faqs={processFaqBlock.faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
