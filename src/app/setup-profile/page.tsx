import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SetupProfileClient from './SetupProfileClient';

export default async function SetupProfilePage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Must be logged in
  if (authError || !user) {
    redirect('/login');
  }

  // If user already has a handle, send them to dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.handle) {
    redirect('/dashboard');
  }

  return <SetupProfileClient email={user.email || ''} />;
}
