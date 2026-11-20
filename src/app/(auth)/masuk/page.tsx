"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "../actions";
import { PasswordField } from "@/components/PasswordField";
import { Field, FormMessage, PrimaryButton } from "@/components/ui";

type Mode = "masuk" | "daftar";

export default function MasukPage() {
  const [mode, setMode] = useState<Mode>("masuk");
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-center font-display text-[28px] font-medium leading-tight tracking-tight">
        {mode === "masuk" ? "Masuk ke AWWAB" : "Bikin akun AWWAB"}
      </h1>
      <div role="tablist" aria-label="Pilih masuk atau daftar" className="grid grid-cols-2 gap-1 rounded-full bg-ink p-1">
        {(["masuk", "daftar"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`h-11 rounded-full text-sm font-semibold ${mode === m ? "bg-sun text-ink" : "text-on-ink"}`}
          >
            {m === "masuk" ? "Masuk" : "Daftar"}
          </button>
        ))}
      </div>
      {mode === "masuk" ? <SignInForm /> : <SignUpForm />}
    </div>
  );
}

function SignInForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field id="email" name="email" type="email" label="Email" autoComplete="email" required defaultValue={state.email} />
      <PasswordField id="password" label="Password" autoComplete="current-password" />
      <FormMessage error={state.error} info={state.info} />
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Masuk…" : "Masuk"}
      </PrimaryButton>
      <Link href="/lupa-password" className="self-center py-2 text-sm font-bold text-sky-ink underline-offset-4 hover:underline">
        Lupa password?
      </Link>
    </form>
  );
}

function SignUpForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field id="name" name="name" label="Nama panggilan (opsional)" autoComplete="given-name" placeholder="Awab" maxLength={40} />
      <Field id="email" name="email" type="email" label="Email" autoComplete="email" required defaultValue={state.email} />
      <PasswordField id="password" label="Password" autoComplete="new-password" hint="Minimal 8 karakter" />
      <FormMessage error={state.error} info={state.info} />
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Bikin akun…" : "Bikin akun"}
      </PrimaryButton>
    </form>
  );
}
