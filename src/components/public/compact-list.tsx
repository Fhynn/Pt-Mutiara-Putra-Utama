"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

export function CompactList({ items, label }: { items: string[]; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const hiddenCount = Math.max(items.length - 3, 0);

  return (
    <>
      <ul className={`requirement-list compact-list ${expanded ? "is-expanded" : ""}`} id={listId}>
        {items.map((item) => (
          <li key={item}>
            <span className="compact-list-check" aria-hidden="true">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {hiddenCount ? (
        <button
          aria-controls={listId}
          aria-expanded={expanded}
          className="compact-list-toggle"
          type="button"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Tampilkan lebih ringkas" : `Lihat ${hiddenCount} ${label} lainnya`}
          <ChevronDown aria-hidden="true" />
        </button>
      ) : null}
    </>
  );
}
