'use client';

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/lib/auth-actions";

import { SubmitButton } from "./submit-button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form
      action={formAction}
      className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur"
    >
      <label className="block text-left text-sm text-white/80">
        Email or username
        <input
          type="text"
          name="identifier"
          placeholder="runner@example.com"
          required
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-base text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
        />
      </label>
      <label className="block text-left text-sm text-white/80">
        Password
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          required
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-base text-white outline-none placeholder:text-white/40 focus:border-emerald-300/70"
        />
      </label>
      {state?.error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {state.error}
        </p>
      )}
      <SubmitButton label="Sign in" pendingLabel="Signing in..." />
      <p className="text-center text-xs text-white/60">
        Authentication powered by OpenAuth Password service.
      </p>
    </form>
  );
}
