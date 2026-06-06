'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { Resend } from 'resend';
import { redirect } from 'next/navigation';

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();

  // Sign up user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Auto-confirm the user's email using the Admin client
  if (data?.user?.id) {
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });

      // Automatically sign in the user now that they are confirmed
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch (adminError) {
      console.error('Error auto-confirming or signing in user:', adminError);
    }
  }

  // Send welcome email via Resend
  if (data?.user?.email) {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: 'Bookmarks App <onboarding@resend.dev>',
          to: [data.user.email],
          subject: 'Welcome to Bookmarks!',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; background-color: #ffffff; border-radius: 12px; border: 1px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
               <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #000; letter-spacing: -0.02em;">Welcome to Bookmarks! 🚀</h1>
               <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: 16px;">Hey <strong>${data.user.email}</strong>,</p>
               <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: 24px;">Thank you for signing up! We're thrilled to help you keep track of your favorite bookmarks, articles, and websites.</p>
               <div style="margin-bottom: 32px;">
                 <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000'}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 500; font-size: 15px; transition: background-color 0.2s;">
                   Go to App
                 </a>
               </div>
               <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0;" />
               <p style="font-size: 12px; line-height: 1.5; color: #888888; margin: 0;">If you didn't create this account, please ignore this email.</p>
            </div>
          `,
        });
      } else {
        console.warn('RESEND_API_KEY environment variable is not defined.');
      }
    } catch (emailError) {
      console.error('Error sending welcome email via Resend:', emailError);
    }
  }

  redirect('/dashboard');
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
    // If email is not confirmed, try auto-confirming it using the admin client
    if (error.message.includes('Email not confirmed') || error.message.includes('confirm')) {
      try {
        const adminClient = createAdminClient();
        const { data: { users } } = await adminClient.auth.admin.listUsers();
        const user = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        
        if (user) {
          await adminClient.auth.admin.updateUserById(user.id, {
            email_confirm: true,
          });

          // Retry the login
          const retry = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!retry.error) {
            redirect('/dashboard');
          }
          return { error: retry.error.message };
        }
      } catch (adminError) {
        console.error('Error auto-confirming email during login:', adminError);
      }
    }
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
