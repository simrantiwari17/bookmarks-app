'use server';

import { createClient } from '@/utils/supabase/server';
import { isReservedHandle } from '@/lib/constants';
import { ensureProfile } from '@/lib/profile';
import { revalidatePath } from 'next/cache';

const HANDLE_REGEX = /^[a-zA-Z0-9_]+$/;

export async function claimHandle(prevState: any, formData: FormData) {
  const handle = (formData.get('handle') as string)?.trim().toLowerCase();

  if (!handle) {
    return { error: 'Handle is required.' };
  }

  if (handle.length < 3) {
    return { error: 'Handle must be at least 3 characters.' };
  }

  if (handle.length > 30) {
    return { error: 'Handle must be 30 characters or fewer.' };
  }

  if (!HANDLE_REGEX.test(handle)) {
    return { error: 'Handle can only contain letters, numbers, and underscores.' };
  }

  if (isReservedHandle(handle)) {
    return { error: `@${handle} is reserved. Try another one.` };
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be signed in.' };
  }

  // Check if handle is already taken
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('handle', handle)
    .maybeSingle();

  if (existing && existing.id !== user.id) {
    return { error: `@${handle} is already taken. Try another one.` };
  }

  try {
    await ensureProfile(supabase, user.id);
  } catch {
    return { error: 'Could not create your profile. Please try again.' };
  }

  // Upsert so we save even if the signup trigger never created a profile row
  const { data: saved, error: saveError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, handle }, { onConflict: 'id' })
    .select('handle')
    .single();

  if (saveError) {
    if (saveError.code === '23505') {
      return { error: `@${handle} was just taken. Try another one.` };
    }
    return { error: saveError.message };
  }

  if (!saved?.handle) {
    return {
      error:
        'Your handle was not saved. Make sure the database schema is set up (run supabase/schema.sql in Supabase).',
    };
  }

  revalidatePath('/setup-profile');
  revalidatePath('/dashboard');
  return { error: '', success: true };
}
