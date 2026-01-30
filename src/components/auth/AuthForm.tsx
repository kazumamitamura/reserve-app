"use client";

import { useFormState } from "react-dom";
import type { login, register, AuthState } from "@/app/actions/auth";

type AuthFormProps = {
  action: typeof login | typeof register;
  type: "login" | "register";
};

export function AuthForm({ action, type }: AuthFormProps) {
  const [state, formAction] = useFormState(action, null as AuthState);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2 text-slate-900 shadow-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
        />
      </div>
      {type === "register" && (
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-slate-700">
            表示名（任意）
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            autoComplete="name"
            className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2 text-slate-900 shadow-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
          />
        </div>
      )}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={type === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
          className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2 text-slate-900 shadow-sm focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-sage-500 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2 transition"
      >
        {type === "login" ? "ログイン" : "登録する"}
      </button>
    </form>
  );
}
