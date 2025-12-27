// src/ui/Inputs/Accordion/Accordion.tsx
import React, { useMemo, useState, useRef } from "react";

export type AccordionItem = {
  id: string;
  heading: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
};

type AccordionProps = {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
};

export function Accordion({
  items,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const initial = useMemo(
    () =>
      new Set(
        items
          .filter((i) => i.defaultOpen && !i.disabled)
          .map((i) => i.id)
      ),
    [items]
  );

  const [openIds, setOpenIds] = useState<Set<string>>(initial);
  const listRef = useRef<HTMLDivElement>(null);

  const isOpen = (id: string) => openIds.has(id);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  // Keyboard navigation is now bound to the header <button> elements
  const handleHeaderKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    const focusables =
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        ".accordion__header button"
      );
    if (!focusables || focusables.length === 0) return;

    const buttons = Array.from(focusables);
    const idx = buttons.findIndex((el) => el === e.currentTarget);
    if (idx === -1) return;

    const focusIdx = (i: number) => {
      const el = buttons[i];
      if (el) el.focus();
    };

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusIdx((idx + 1) % buttons.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusIdx((idx - 1 + buttons.length) % buttons.length);
        break;
      case "Home":
        e.preventDefault();
        focusIdx(0);
        break;
      case "End":
        e.preventDefault();
        focusIdx(buttons.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`accordion ${className ?? ""}`.trim()}
      ref={listRef}
    >
      {items.map((item) => {
        const open = isOpen(item.id);
        const regionId = `acc-panel-${item.id}`;
        const btnId = `acc-btn-${item.id}`;

        return (
          <div
            className={`accordion__item ${open ? "is-open" : ""}`}
            key={item.id}
          >
            <div className="accordion__header">
              <button
                id={btnId}
                type="button"
                aria-expanded={open}
                aria-controls={regionId}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                onKeyDown={handleHeaderKeyDown}
              >
                {item.heading}
                <span className="accordion__icon" aria-hidden>
                  ▸
                </span>
              </button>
            </div>
            <div
              id={regionId}
              role="region"
              aria-labelledby={btnId}
              className="accordion__panel"
              hidden={!open}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
