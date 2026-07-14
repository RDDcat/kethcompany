import { processFaqBlock } from "../lib/content";
import FaqAccordion from "./FaqAccordion";
import ProcessSteps from "./ProcessSteps";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function ProcessFaq() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <SectionHeading
          eyebrow="Process & FAQ"
          title="합류까지, 이렇게 진행됩니다"
          description={processFaqBlock.processIntro}
        />

        <div className="mt-14">
          <ProcessSteps steps={processFaqBlock.steps} />
        </div>

        <Reveal className="mt-20">
          <h3 className="text-2xl font-bold tracking-display text-ink">
            자주 묻는 질문
          </h3>
          <div className="mt-8">
            <FaqAccordion faqs={processFaqBlock.faqs} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
