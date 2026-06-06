# Running locally

1. Clone the repo: `git clone https://github.com/simrantiwari17/bookmarks-app`
2. Install dependencies: `npm install`
3. Create `.env.local` and add your Supabase and Resend keys (see .env.example)
4. Run: `npm run dev -- --webpack`
5. Open http://localhost:3000

# Where the AI got something wrong

- Welcome email “Go to App” link
- And used NEXT_PUBLIC_SUPABASE_URL instead of the app URL
- And if not clicked then it showed 'No email confirmation' and users couldn't redirect to dashboard
- Fixed it by telling cursor this issue and telling it to fix it

# One thing you'd improve with more time
  
- Searching bookmarks functionality