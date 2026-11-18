"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; info?: string; email?: string };

const MIN_PASSWORD = 8;

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function field(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const email = field(form, "email");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Isi email dan password dulu.", email };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (/confirm/i.test(error.message)) return { error: "Email belum dikonfirmasi. Cek kotak masuk kamu.", email };
    return { error: "Email atau password salah", email };
  }
  redirect("/hari-ini");
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const email = field(form, "email");
  const password = String(form.get("password") ?? "");
  const name = field(form, "name").split(/\s+/)[0]?.slice(0, 40) || null;
  if (!email) return { error: "Isi email dulu.", email };
  if (password.length < MIN_PASSWORD) return { error: "Password minimal 8 karakter", email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await origin()}/auth/callback?next=/mulai`, data: { display_name: name } },
  });
  if (error) {
    if (/already/i.test(error.message)) return { error: "Email ini sudah terdaftar. Coba masuk.", email };
    return { error: "Gagal bikin akun. Coba lagi sebentar lagi.", email };
  }
  // Supabase returns a user without identities when the email is taken (and confirmation is on).
  if (data.user && data.user.identities?.length === 0) {
    return { error: "Email ini sudah terdaftar. Coba masuk.", email };
  }
  if (!data.session) {
    return { info: "Akun dibuat. Cek email kamu buat konfirmasi, lalu masuk.", email };
  }
  await supabase.from("settings").upsert({ display_name: name });
  redirect("/mulai");
}

export async function requestReset(_: AuthState, form: FormData): Promise<AuthState> {
  const email = field(form, "email");
  if (!email) return { error: "Isi email dulu." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/password-baru`,
  });
  // Same answer whether or not the email exists, so accounts can't be probed.
  return { info: "Cek email kamu untuk link ganti password.", email };
}

export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_PASSWORD) return { error: "Password minimal 8 karakter" };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (/session/i.test(error.message)) return { error: "Link sudah kedaluwarsa. Minta link baru dari halaman lupa password." };
    if (/different/i.test(error.message)) return { error: "Password baru harus beda dari yang lama." };
    return { error: "Gagal menyimpan password. Coba lagi." };
  }
  return { info: "Password tersimpan." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}
