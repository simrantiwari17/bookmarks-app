'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { claimHandle } from './actions';

const HANDLE_REGEX = /^[a-zA-Z0-9_]*$/;

const initialState = { error: '', success: false };

export default function SetupProfileClient({ email }: { email: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(claimHandle, initialState);
  const [handle, setHandle] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (state?.success) {
      router.replace('/dashboard');
    }
  }, [state?.success, router]);

  const handleChange = (value: string) => {
    const lower = value.toLowerCase();
    setHandle(lower);
    if (lower && !HANDLE_REGEX.test(lower)) {
      setLocalError('Only letters, numbers, and underscores are allowed.');
    } else if (lower.length > 0 && lower.length < 3) {
      setLocalError('Must be at least 3 characters.');
    } else {
      setLocalError('');
    }
  };

  const displayError = state?.error || localError;

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Background decorative gradient meshes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none dark:bg-indigo-500/5" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none dark:bg-emerald-500/5" />

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 shadow-lg shadow-indigo-500/20 mb-5">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Claim your handle
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 text-center max-w-xs">
            Choose a unique username for your public profile. This is how others will find you.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-xl shadow-zinc-200/20 dark:shadow-none">
          <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Signed in as <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>
          </div>

          <form action={formAction} className="space-y-5">
            {displayError && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm">
                <svg
                  className="w-5 h-5 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{displayError}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="handle"
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Your Handle
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 font-medium">
                  @
                </span>
                <input
                  id="handle"
                  name="handle"
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="your_handle"
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200"
                />
              </div>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                Letters, numbers, and underscores only. At least 3 characters.
              </p>
            </div>

            {/* Preview */}
            {handle.length >= 3 && HANDLE_REGEX.test(handle) && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/20 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Your profile will be at </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  /{handle}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !!localError || handle.length < 3}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Claiming...</span>
                </div>
              ) : (
                'Claim Handle'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
