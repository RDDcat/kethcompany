import type { ProcessStep } from "../lib/content";
import Reveal from "./Reveal";

export default function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-5">
      {steps.map((s, i) => (
        <Reveal
          key={s.title}
          delay={i * 60}
          className="flex flex-col bg-white p-6 md:p-7"
        >
          <span className="text-sm font-bold tracking-widest text-subtle">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 text-base font-bold text-ink md:text-lg">
            {s.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
        </Reveal>
      ))}
    </div>
  );
}
