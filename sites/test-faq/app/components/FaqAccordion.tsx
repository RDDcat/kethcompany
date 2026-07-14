"use client";

import { useState } from "react";
import type { Faq } from "../lib/content";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="flex items-start gap-4">
                <span className="text-sm font-bold text-subtle">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-semibold text-ink md:text-lg">
                  {f.q}
                </span>
              </span>
              <span
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line-strong text-ink transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                +
              </span>
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-7 pl-10 text-[15px] leading-relaxed text-muted md:text-base">
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
