"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FaqAccordion({
  items
}: {
  items: Array<{ id: string; question: string; answer: string }>;
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div className="faq-list">
      {items.map((item) => {
        const expanded = open === item.id;
        return (
          <div className="faq-item" key={item.id}>
            <button
              className="faq-trigger"
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : item.id)}
            >
              {item.question}
              <ChevronDown className="faq-chevron" size={20} aria-hidden="true" />
            </button>
            <div className="faq-answer-wrap" aria-hidden={!expanded}>
              <p className="faq-answer">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
