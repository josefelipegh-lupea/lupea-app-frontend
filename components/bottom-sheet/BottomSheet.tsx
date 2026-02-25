"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

import styles from "./BottomSheet.module.css";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  onAnimationComplete?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  children: ReactNode;
  className?: string;
}

export default function BottomSheet({
  open,
  onClose,
  onAnimationComplete,
  onSubmit,
  children,
  className,
}: BottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);

  const startY = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const startDrag = (clientY: number) => {
    if (closing) return;
    setDragging(true);
    startY.current = clientY;
    lastY.current = clientY;
    lastTime.current = Date.now();
    document.body.style.overflow = "hidden";
  };

  const moveDrag = (clientY: number) => {
    if (!dragging || closing || window.innerWidth > 768) return;

    const delta = clientY - startY.current;
    if (delta > 0) {
      setDragY(delta);
      lastY.current = clientY;
      lastTime.current = Date.now();
    }
  };

  const animateClose = () => {
    const sheetHeight = sheetRef.current?.offsetHeight ?? 0;
    setClosing(true);
    setDragY(sheetHeight + 40);
  };

  const endDrag = () => {
    if (!dragging || closing) return;

    setDragging(false);
    document.body.style.overflow = "";

    const sheetHeight = sheetRef.current?.offsetHeight ?? 0;
    const deltaY = lastY.current - startY.current;
    const deltaTime = Date.now() - lastTime.current;
    const velocity = deltaTime > 0 ? deltaY / deltaTime : 0;

    const nearBottom = sheetHeight - dragY < 100;
    const fastSwipe = velocity > 5;

    if (nearBottom || fastSwipe) {
      animateClose();
    } else {
      setDragY(0);
    }
  };

  const closeWithAnimation = () => {
    setClosing(true);
    setDragY(window.innerHeight);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 350);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      moveDrag(e.touches[0].clientY);
    };

    const onMouseUp = () => endDrag();
    const onTouchEnd = () => endDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging, dragY, closing]);

  useEffect(() => {
    if (!closing) return;

    const timer = setTimeout(() => {
      onClose();
      if (onAnimationComplete) onAnimationComplete();
      setClosing(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [closing, onClose]);

  useEffect(() => {
    const close = () => closeWithAnimation();
    document.addEventListener("close-sheet", close);
    return () => document.removeEventListener("close-sheet", close);
  }, []);

  if (!open) return null;

  return (
    <form
      className={styles.wrapper}
      key={open ? "open" : "closed"}
      onSubmit={onSubmit}
    >
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${className || ""}`}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging
            ? "none"
            : "transform 0.35s cubic-bezier(.22,1,.36,1)",
          touchAction: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.dragHandle}
          onMouseDown={(e) => startDrag(e.clientY)}
          onTouchStart={(e) => startDrag(e.touches[0].clientY)}
        >
          <div className={styles.formBar} />
        </div>

        <div className={styles.scrollableContent}>{children}</div>
      </div>
    </form>
  );
}
