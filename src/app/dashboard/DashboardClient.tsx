'use client';

import { useState, useTransition, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { logout } from '@/app/auth/actions';
import { addBookmark, editBookmark, deleteBookmark } from './actions';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  created_at: string;
}

interface DashboardClientProps {
  user: any;
  profile: {
    handle: string;
  };
  initialBookmarks: Bookmark[];
}

const initialFormState = { error: '', success: false };

export default function DashboardClient({ user, profile, initialBookmarks }: DashboardClientProps) {
  // Bookmarks state updated from prop or optimistically
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPendingDelete, startDeleteTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  // Synchronize initialBookmarks when database state changes (e.g. server revalidation)
  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  // Form actions with useActionState
  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    let result;
    if (modalMode === 'add') {
      result = await addBookmark(prevState, formData);
    } else {
      result = await editBookmark(prevState, formData);
    }

    if (result.success) {
      setIsModalOpen(false);
      setSelectedBookmark(null);
      return { error: '', success: true };
    }
    return { error: result.error || 'Something went wrong.', success: false };
  };

  const [formState, formAction, isFormPending] = useActionState(handleFormSubmit, initialFormState);

  // Trigger modal for Adding
  const openAddModal = () => {
    setModalMode('add');
    setSelectedBookmark(null);
    setIsModalOpen(true);
  };

  // Trigger modal for Editing
  const openEditModal = (bookmark: Bookmark) => {
    setModalMode('edit');
    setSelectedBookmark(bookmark);
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      startDeleteTransition(async () => {
        // Optimistic delete UI update
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
        const res = await deleteBookmark(id);
        if (res?.error) {
          alert(res.error);
          // Revert optimistic delete if it fails
          setBookmarks(initialBookmarks);
        }
      });
    }
  };

  // Filter bookmarks by search
  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 flex flex-col font-sans">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none dark:bg-indigo-500/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none dark:bg-rose-500/2" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-md shadow-indigo-500/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
              Bookmarks
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/${profile.handle}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
            >
              View public profile
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                @{profile.handle}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {user.email}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="py-2 px-4 rounded-xl border border-zinc-200 hover:border-rose-200 dark:border-zinc-800 dark:hover:border-rose-900 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 text-zinc-700 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400 text-sm font-medium transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search bookmarks by title or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 shadow-sm shadow-zinc-200/5 dark:shadow-none"
            />
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Bookmark
          </button>
        </div>

        {/* Bookmarks List */}
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white/50 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              No bookmarks found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto">
              {searchQuery
                ? "We couldn't find anything matching your search terms."
                : 'Get started by creating your first bookmark to organize your workspace.'}
            </p>
            {!searchQuery && (
              <button
                onClick={openAddModal}
                className="mt-5 py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm transition duration-150"
              >
                Add Bookmark
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  {/* Visibility Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      bookmark.is_public
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${bookmark.is_public ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                    {bookmark.is_public ? 'Public' : 'Private'}
                  </span>

                  {/* Actions Dropdown/Row */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEditModal(bookmark)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(bookmark.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-550 mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {bookmark.title}
                </h4>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition font-medium max-w-full break-all mb-4"
                >
                  <span className="line-clamp-1">{bookmark.url}</span>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Added {new Date(bookmark.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Unified Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl max-w-md w-full p-8 shadow-2xl z-10 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-1">
              {modalMode === 'add' ? 'Add Bookmark' : 'Edit Bookmark'}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
              {modalMode === 'add'
                ? 'Save your favorite site or resource.'
                : 'Make changes to your saved bookmark.'}
            </p>

            <form action={formAction} className="space-y-5">
              {selectedBookmark && <input type="hidden" name="id" value={selectedBookmark.id} />}

              {formState?.error && (
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm">
                  {formState.error}
                </div>
              )}

              {/* Title input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue={selectedBookmark?.title || ''}
                  placeholder="e.g. Next.js Docs"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200"
                />
              </div>

              {/* URL input */}
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  URL
                </label>
                <input
                  id="url"
                  name="url"
                  type="text"
                  required
                  defaultValue={selectedBookmark?.url || ''}
                  placeholder="e.g. https://nextjs.org"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200"
                />
              </div>

              {/* Visibility selection */}
              <div>
                <label
                  htmlFor="is_public"
                  className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Visibility
                </label>
                <select
                  id="is_public"
                  name="is_public"
                  defaultValue={selectedBookmark?.is_public ? 'true' : 'false'}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200"
                >
                  <option value="false">Private (Only you can access)</option>
                  <option value="true">Public (Anyone can read)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-3 px-5 rounded-2xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-300 font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormPending}
                  className="py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFormPending ? 'Saving...' : 'Save Bookmark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
