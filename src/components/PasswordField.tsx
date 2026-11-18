"use client";
import { useState } from "react";

export function PasswordField({
  id,
  label,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  hint?: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-plum">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name="password"
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={autoComplete === "new-password" ? 8 : undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="h-[52px] w-full rounded-2xl border-2 border-track bg-paper pl-4 pr-14 text-base font-semibold text-plum focus:border-plum focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={shown}
          className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-plum-soft hover:text-plum"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {shown && <path d="M4 4l16 16" />}
          </svg>
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs font-semibold text-plum-soft">
          {hint}
        </p>
      )}
    </div>
  );
}
