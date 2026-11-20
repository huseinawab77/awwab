"use client";
import { useEffect, useState } from "react";

type Listener = (text: string) => void;
const listeners = new Set<Listener>();

/** Show a short message at the bottom of the screen. */
export function toast(text: string) {
  listeners.forEach((l) => l(text));
}

export function Toaster() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show: Listener = (t) => {
      setText(t);
      clearTimeout(timer);
      timer = setTimeout(() => setText(null), 3200);
    };
    listeners.add(show);
    return () => {
      listeners.delete(show);
      clearTimeout(timer);
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[104px] z-[60] flex justify-center px-4">
      {text && (
        <p role="status" className="sheet-up rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper shadow-float">
          {text}
        </p>
      )}
    </div>
  );
}
