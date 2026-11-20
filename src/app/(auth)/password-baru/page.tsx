"use client";
import Link from "next/link";
import { useActionState } from "react";
import { updatePassword, type AuthState } from "../actions";
import { PasswordField } from "@/components/PasswordField";
import { FormMessage, PrimaryButton } from "@/components/ui";

export default function PasswordBaruPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <h1 className="text-center font-display text-[28px] font-medium leading-tight tracking-tight">Bikin password baru</h1>
      <PasswordField id="password" label="Password baru" autoComplete="new-password" hint="Minimal 8 karakter" />
      <FormMessage error={state.error} info={state.info} />
      {state.info ? (
        <Link
          href="/hari-ini"
          className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-ink px-6 font-semibold text-paper"
        >
          Lanjut ke Hari Ini
        </Link>
      ) : (
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan password"}
        </PrimaryButton>
      )}
    </form>
  );
}
