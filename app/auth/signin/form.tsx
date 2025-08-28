"use client";

import { useActionState } from "react";
import { signin } from "@/actions/auth";

export default function SignInForm() {
  const [state, action, pending] = useActionState(signin, undefined);
  return (
    <form
      action={action}
      className="max-w-sm mx-auto mt-10 p-4 border rounded-sm shadow-sm"
    >
      <h2 className="text-maintext text-xl font-semibold mb-4">Login</h2>
      <div className="mb-3">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          className="w-full border px-3 py-2 rounded-sm mt-1"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          className="w-full border px-3 py-2 rounded-sm mt-1"
          required
        />
      </div>
      {state?.error && <p className="text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-sm hover:bg-blue-700 transition"
      >
        Log In
      </button>
    </form>
  );
}
