"use client";
import Link from "next/link";
import { useActionState } from "react";
import { requestReset, type AuthState } from "../actions";
import { Field, FormMessage, PrimaryButton } from "@/components/ui";

export default function LupaPasswordPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestReset, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <h1 className="text-center font-display text-[28px] font-extrabold leading-tight tracking-tight">Lupa password</h1>
      <p className="text-center text-sm font-semibold text-plum-soft">
        Masukkan email akunmu. Kami kirim link buat bikin password baru.
      </p>
      <Field id="email" name="email" type="email" label="Email" autoComplete="email" required defaultValue={state.email} />
      <FormMessage error={state.error} info={state.info} />
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Mengirim…" : "Kirim link"}
      </PrimaryButton>
      <Link href="/masuk" className="self-center py-2 text-sm font-bold text-lilac-ink underline-offset-4 hover:underline">
        Kembali ke masuk
      </Link>
    </form>
  );
}
