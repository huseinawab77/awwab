import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

/** Text input with a visible label above it (52px tall). */
export function Field({
  label,
  id,
  hint,
  error,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; hint?: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="h-[52px] w-full rounded-2xl border-2 border-track bg-paper px-4 text-base font-semibold text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none"
        {...input}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs font-semibold text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-bold text-tangerine-ink">
          {error}
        </p>
      )}
    </div>
  );
}

const base =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export function PrimaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${base} bg-ink text-paper ${className}`} {...props} />;
}

export function AccentButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${base} bg-tangerine text-ink ${className}`} {...props} />;
}

export function SecondaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${base} bg-butter text-ink border-[1.5px] border-line ${className}`} {...props} />;
}

/** Status line for form results: errors are announced, info is polite. */
export function FormMessage({ error, info }: { error?: string; info?: string }) {
  if (error)
    return (
      <p role="alert" className="rounded-2xl bg-peach px-4 py-3 text-sm font-bold text-tangerine-ink">
        {error}
      </p>
    );
  if (info)
    return (
      <p role="status" className="rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-mint-ink">
        {info}
      </p>
    );
  return null;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-panel bg-paper p-5 ${className}`}>{children}</div>;
}
