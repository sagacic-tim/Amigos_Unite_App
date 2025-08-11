
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

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const initial = useMemo(
    () => new Set(items.filter(i => i.defaultOpen && !i.disabled).map(i => i.id)),
    [items]
  );
  const [openIds, setOpenIds] = useState<Set<string>>(initial);
  const listRef = useRef<HTMLDivElement>(null);

  const isOpen = (id: string) => openIds.has(id);
  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const enabled = items.filter(i => !i.disabled);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const focusables = listRef.current?.querySelectorAll<HTMLButtonElement>(".accordion__header button");
    if (!focusables || !focusables.length) return;
    const idx = Array.from(focusables).findIndex(el => el === document.activeElement);

    const focusIdx = (i: number) => focusables[i]?.focus();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusIdx((idx + 1) % focusables.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusIdx((idx - 1 + focusables.length) % focusables.length);
        break;
      case "Home":
        e.preventDefault();
        focusIdx(0);
        break;
      case "End":
        e.preventDefault();
        focusIdx(focusables.length - 1);
        break;
    }
  };

  return (
    <div className={`accordion ${className ?? ""}`.trim()} ref={listRef} onKeyDown={onKeyDown}>
      {items.map((item) => {
        const open = isOpen(item.id);
        const regionId = `acc-panel-${item.id}`;
        const btnId = `acc-btn-${item.id}`;
        return (
          <div className={`accordion__item ${open ? "is-open" : ""}`} key={item.id}>
            <div className="accordion__header">
              <button
                id={btnId}
                type="button"
                aria-expanded={open}
                aria-controls={regionId}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
              >
                {item.heading}
                <span className="accordion__icon" aria-hidden>▸</span>
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
