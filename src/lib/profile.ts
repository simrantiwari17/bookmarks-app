import type { createClient } from '@/utils/supabase/server';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** Ensures a profiles row exists (covers users created before the DB trigger was added). */
export async function ensureProfile(supabase: SupabaseClient, userId: string) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from('profiles').insert({ id: userId });

  // Another request may have inserted the row first — safe to ignore.
  if (error && error.code !== '23505') {
    throw error;
  }
}
