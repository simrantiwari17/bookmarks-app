import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  // Fetch the profile by handle
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch public bookmarks for this profile
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Decorative backgrounds */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-xl shadow-indigo-500/15 mx-auto mb-5">
            <span className="text-3xl font-extrabold text-white uppercase">
              {handle.charAt(0)}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            @{handle}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {bookmarks && bookmarks.length > 0
              ? `${bookmarks.length} public bookmark${bookmarks.length === 1 ? '' : 's'}`
              : 'No public bookmarks yet'}
          </p>
        </div>

        {/* Bookmarks List */}
        {bookmarks && bookmarks.length > 0 ? (
          <div className="space-y-4">
            {bookmarks.map((bookmark: any) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {bookmark.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-1">
                      {bookmark.url}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                  Added {new Date(bookmark.created_at).toLocaleDateString()}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              No public bookmarks
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto">
              This user hasn&apos;t shared any bookmarks publicly yet.
            </p>
          </div>
        )}

        {/* Footer link */}
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
          >
            Create your own bookmarks page
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
