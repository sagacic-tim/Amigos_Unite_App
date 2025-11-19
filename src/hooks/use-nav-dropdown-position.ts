// src/hooks/useNavDropdownPosition.ts
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface DropdownPosition {
  top: number;
  left: number;
}

interface Options {
  /** Vertical offset below the anchor in px (default: 14) */
  offset?: number;
  /** Expected panel width in px for overflow detection (default: 320) */
  panelWidth?: number;
  /** Right margin from viewport edge in px (default: 8) */
  margin?: number;
}

/**
 * Shared positioning + dismissal logic for header/nav dropdowns.
 *
 * - Positions panel 14px below the anchor by default.
 * - Aligns to the left edge of the anchor unless that would overflow
 *   the right side of the viewport; in that case it right-aligns.
 * - Closes on click-outside and on Escape.
 * - Focuses the first interactive item when opened.
 */
export function useNavDropdownPosition<T extends HTMLElement>(
  anchorRef: React.RefObject<T>,
  open: boolean,
  onClose: () => void,
  { offset = 8, panelWidth = 320, margin = 8 }: Options = {}
) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  // Compute top/left from anchor + viewport width
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    let left = rect.left;
    const right = left + panelWidth;

    if (right > viewportWidth - margin) {
      // Align right edge with anchor, but keep a small margin
      left = Math.max(margin, rect.right - panelWidth);
    }

    setPosition({
      top: rect.bottom + offset,
      left,
    });
  }, [open, anchorRef, offset, panelWidth, margin]);

  // Click outside + Escape handling
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !anchorRef.current?.contains(target)
      ) {
        onClose();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        anchorRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    // Focus first item on open
    if (firstItemRef.current) {
      firstItemRef.current.focus();
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, anchorRef]);

  return { panelRef, firstItemRef, position };
}

