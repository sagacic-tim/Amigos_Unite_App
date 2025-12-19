
import React, { useMemo, useRef, useState } from "react";

type Tab = {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  tabs: Tab[];
  className?: string;
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
};

export function Tabs({
  tabs,
  className,
  defaultActiveId,
  activeId,
  onChange
}: TabsProps) {
  const isControlled = activeId !== undefined && onChange;
  const [internalActive, setInternalActive] = useState<string>(
    defaultActiveId ?? tabs.find(t => !t.disabled)?.id ?? tabs[0]?.id
  );
  const current = isControlled ? activeId! : internalActive;
  const listRef = useRef<HTMLDivElement>(null);

  const enabledTabs = useMemo(
    () => tabs.filter(t => !t.disabled),
    [tabs]
  );

  const focusTabButton = (id: string) => {
    const idx = tabs.findIndex(t => t.id === id);
    const btn = listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[idx];
    btn?.focus();
  };

  const setActive = (id: string) => {
    if (isControlled) onChange!(id);
    else setInternalActive(id);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = enabledTabs.findIndex(t => t.id === current);
    if (idx < 0) return;

    const goto = (i: number) => {
      const id = enabledTabs[i].id;
      setActive(id);
      requestAnimationFrame(() => focusTabButton(id));
    };

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        goto((idx + 1) % enabledTabs.length);
        break;
      case "ArrowLeft":
        e.preventDefault();
        goto((idx - 1 + enabledTabs.length) % enabledTabs.length);
        break;
      case "Home":
        e.preventDefault();
        goto(0);
        break;
      case "End":
        e.preventDefault();
        goto(enabledTabs.length - 1);
        break;
    }
  };

  return (
    <div className={`tabs ${className ?? ""}`.trim()}>
      <div
        className="tabs__list"
        role="tablist"
        aria-label="Tabs"
        onKeyDown={onKeyDown}
        ref={listRef}
      >
        {tabs.map((t, i) => {
          const isActive = t.id === current;
          return (
            <button
              key={t.id}
              className={`tabs__trigger ${isActive ? "is-active" : ""}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={t.disabled}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map(t => {
        const isActive = t.id === current;
        return (
          <div
            key={t.id}
            className={`tabs__panel ${isActive ? "is-active" : ""}`}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            hidden={!isActive}
          >
            {t.content}
          </div>
        );
      })}
    </div>
  );
}
