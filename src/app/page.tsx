import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none dark:bg-indigo-500/5" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-[130px] pointer-events-none dark:bg-rose-500/5" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Logo Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-xl shadow-indigo-500/20 mb-8 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 max-w-2xl leading-[1.1]">
          Organize your web{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 dark:from-indigo-400 dark:to-rose-400">
            beautifully.
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-10">
          The minimal, premium bookmark manager. Keep track of inspiration, articles, and code snippets, then share your favorite ones with a personalized public profile.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 text-white font-semibold dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-950/10 hover:-translate-y-0.5 transition duration-200 text-center"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-zinc-900 font-semibold border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:-translate-y-0.5 transition duration-200 text-center"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-850 p-6 rounded-2xl">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-2">⚡ Simple CRUD</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Instantly create, search, edit, and delete links via an intuitive dashboard modal interface.
            </p>
          </div>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-850 p-6 rounded-2xl">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-2">🌍 Public Profiles</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Claim your unique <b>@[handle]</b> and showcase your curated public bookmarks to the world.
            </p>
          </div>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-850 p-6 rounded-2xl">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-2">🔒 Secure & Fast</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Powered by Supabase RLS and server-side authentication rendering for complete data security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
