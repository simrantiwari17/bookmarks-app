'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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
    .single();

  if (existing && existing.id !== user.id) {
    return { error: `@${handle} is already taken. Try another one.` };
  }

  // Update the profile with the claimed handle
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ handle })
    .eq('id', user.id);

  if (updateError) {
    // Could be a unique constraint violation if race condition
    if (updateError.code === '23505') {
      return { error: `@${handle} was just taken. Try another one.` };
    }
    return { error: updateError.message };
  }

  redirect('/dashboard');
}
