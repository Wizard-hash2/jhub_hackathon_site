"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/faq";
import { ChevronDownIcon } from "./icons";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-edge-soft overflow-hidden rounded-2xl border border-edge-soft bg-card">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-white">{item.question}</span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-fog transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm leading-relaxed text-mist">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
