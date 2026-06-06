'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function revalidateDashboardAndProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  revalidatePath('/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('handle')
    .eq('id', userId)
    .single();

  if (profile?.handle) {
    revalidatePath(`/${profile.handle}`);
  }
}

export async function addBookmark(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const is_public = formData.get('is_public') === 'true';

  if (!title || !url) {
    return { error: 'Title and URL are required.' };
  }

  // Basic URL validation
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return { error: 'Please enter a valid URL.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Unauthenticated. Please sign in again.' };
  }

  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

  const { error } = await supabase.from('bookmarks').insert({
    user_id: user.id,
    title,
    url: formattedUrl,
    is_public,
  });

  if (error) {
    return { error: error.message };
  }

  await revalidateDashboardAndProfile(supabase, user.id);
  return { success: true };
}

export async function editBookmark(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const is_public = formData.get('is_public') === 'true';

  if (!id || !title || !url) {
    return { error: 'All fields are required.' };
  }

  // Basic URL validation
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return { error: 'Please enter a valid URL.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Unauthenticated. Please sign in again.' };
  }

  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

  const { error } = await supabase
    .from('bookmarks')
    .update({
      title,
      url: formattedUrl,
      is_public,
    })
    .eq('id', id)
    .eq('user_id', user.id); // Secure ownership check

  if (error) {
    return { error: error.message };
  }

  await revalidateDashboardAndProfile(supabase, user.id);
  return { success: true };
}

export async function deleteBookmark(id: string) {
  if (!id) {
    return { error: 'Bookmark ID is required.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Unauthenticated. Please sign in again.' };
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Secure ownership check

  if (error) {
    return { error: error.message };
  }

  await revalidateDashboardAndProfile(supabase, user.id);
  return { success: true };
}
