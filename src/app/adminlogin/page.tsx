"use client";

import { useActionState } from "react";
import { ArrowRightIcon, SparkleIcon } from "@/components/icons";
import { loginAction, type LoginState } from "@/lib/auth-actions";

const initialState: LoginState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 pb-24 pt-20 sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-mint text-xl font-bold text-[#062a21]">
        <SparkleIcon className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Admin Login
      </h1>
      <p className="mt-3 text-center text-sm text-mist">
        Restricted area — enter the admin password to manage hackathons and resources.
      </p>

      <form action={formAction} className="mt-8 w-full rounded-2xl border border-edge-soft bg-card p-6">
        {state.error && (
          <div className="mb-4 rounded-lg border border-[#c0392b]/50 bg-[#c0392b]/10 px-4 py-3 text-sm text-[#ff9b8b]">
            {state.error}
          </div>
        )}

        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-mist">
          Password<span className="ml-0.5 text-rose">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-edge bg-panel px-3.5 py-2.5 text-sm text-white placeholder:text-fog focus:border-sky/60 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isPending}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-sky px-5 py-2.5 text-sm font-semibold text-[#03171f] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign in"}
          {!isPending && <ArrowRightIcon className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-xs text-fog">
        Not an admin? <span className="text-mist">This area is for JHUB Africa staff only.</span>
      </p>
    </div>
  );
}
