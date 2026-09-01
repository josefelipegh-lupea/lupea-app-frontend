"use client";

import { forwardRef, ReactNode } from "react";

interface SheetShellProps {
  /** Whether the parent considers the sheet open (controls showModal/close externally). */
  open: boolean;
  /** Whether the slide-up animation has settled to visible position. */
  shown: boolean;
  onRequestClose: () => void;
  onPanelTransitionEnd: () => void;
  ariaLabel: string;
  children: ReactNode;
}

/**
 * Shared bottom-sheet chrome for QuestionSheet and AnswerSheet.
 *
 * Fixes iOS Safari bug where <dialog> UA defaults (inset:0 + margin:auto + max-height
 * calc) are resolved differently from Blink: the box collapsed to min-content height and
 * floated mid-screen. Fix: explicitly own position/inset on mobile (fixed, pinned bottom)
 * and use `svh` units so the iOS dynamic toolbar can't overflow the scroll container.
 *
 * The dialog ref is forwarded so each parent can call showModal()/close() directly.
 */
const SheetShell = forwardRef<HTMLDialogElement, SheetShellProps>(function SheetShell(
  { open, shown, onRequestClose, onPanelTransitionEnd, ariaLabel, children },
  ref,
) {
  if (!open) return null;

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onRequestClose();
      }}
      onClick={(e) => {
        // Backdrop click: target is the <dialog> itself, not any inner child.
        if (e.target === e.currentTarget) onRequestClose();
      }}
      aria-label={ariaLabel}
      // Mobile: explicit fixed + inset-x-0 + bottom-0 overrides UA dialog:modal defaults
      // (inset:0 + margin:auto + max-height:calc) that WebKit resolves differently.
      // Desktop (sm:): restore centered-modal behavior.
      className="
        fixed inset-x-0 bottom-0 top-auto
        m-0 max-h-none
        w-full max-w-full
        bg-transparent p-0
        backdrop:bg-black/40
        sm:inset-0 sm:m-auto sm:max-w-md sm:h-fit sm:max-h-none
      "
    >
      <div
        onTransitionEnd={onPanelTransitionEnd}
        // svh = small viewport height — excludes iOS dynamic toolbar, so the sheet
        // never overflows behind the address bar when it's collapsed.
        // Desktop: 85vh is fine (no dynamic toolbar).
        className="
          flex max-h-[88svh] w-full flex-col overflow-y-auto
          rounded-t-2xl bg-white px-5 pb-6 pt-3
          transition-transform duration-[250ms] ease-out
          sm:max-h-[85vh] sm:rounded-2xl
        "
        style={{ transform: shown ? "translateY(0)" : "translateY(100%)" }}
      >
        {children}
      </div>
    </dialog>
  );
});

export default SheetShell;
