'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { ensureProfile } from '@/lib/profile';
import { Resend } from 'resend';
import { redirect } from 'next/navigation';

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';
}

async function sendWelcomeEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn('RESEND_API_KEY environment variable is not defined.');
    return;
  }

  const appUrl = getAppUrl();
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL?.trim() || 'Bookmarks App <onboarding@resend.dev>',
    to: [email],
    subject: 'Welcome to Bookmarks — your account is ready',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Welcome to Bookmarks</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: 16px;">
          Hi <strong>${email}</strong>, your account has been created and confirmed.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: 24px;">
          Claim your unique @handle, save links, and share your public profile with anyone.
        </p>
        <a href="${appUrl}/setup-profile" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 500;">
          Get started
        </a>
        <p style="font-size: 12px; color: #888; margin-top: 32px;">If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'An account with this email already exists. Please log in.' };
    }
    return { error: error.message };
  }

  if (data?.user?.id) {
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });

      await supabase.auth.signInWithPassword({ email, password });

      await ensureProfile(supabase, data.user.id);
    } catch (adminError) {
      console.error('Error confirming or signing in new user:', adminError);
      return { error: 'Account created but sign-in failed. Please try logging in.' };
    }
  }

  if (data?.user?.email) {
    try {
      await sendWelcomeEmail(data.user.email);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }
  }

  redirect('/setup-profile');
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
