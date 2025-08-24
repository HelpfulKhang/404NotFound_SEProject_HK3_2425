# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

## 2. Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Database Schema

Run the complete SQL script from `lib/scripts.sql` in your Supabase SQL editor. This includes:

- **Profiles table** with user roles (reader, writer, editor, admin)
- **Articles table** with full content management
- **Comments table** with moderation support
- **Categories table** for article organization
- **Article likes and bookmarks** for user engagement
- **Automatic profile creation** on user signup
- **Row Level Security (RLS)** policies for data protection
- **Performance indexes** for fast queries
- **Analytics views** for statistics

The script also includes:
- Automatic triggers for profile creation
- User role management
- Article engagement tracking
- Comment moderation system
- Sample categories data

## 4. Authentication Setup

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
       - `http://localhost:3000/login`
    - `http://localhost:3000/register`

## 5. OAuth Providers (Optional)

### Google OAuth
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Add the client ID and secret to Supabase Auth settings

### Facebook OAuth
1. Go to Facebook Developers
2. Create an app
3. Add OAuth redirect URIs
4. Add the app ID and secret to Supabase Auth settings

## 6. Storage Setup (Optional)

If you want to store article images:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `article-images`
3. Set the bucket to public
4. Add storage policies as needed

## 7. Testing

1. Start your development server: `npm run dev`
2. Try registering a new user
3. Try logging in with email/password
4. Test OAuth providers if configured

### Debugging Registration Issues

If registration isn't working properly:

1. **Run the fix script**: Execute `lib/fix-registration.sql` in your Supabase SQL editor
2. **Test registration**: Try registering a new user
3. **Check browser console**: Look for any error messages during registration
4. **Verify environment variables**: Make sure your Supabase URL and anon key are correct

### Script Order for Setup

1. **First**: Run `lib/scripts.sql` (your main setup script)
2. **If registration fails**: Run `lib/fix-registration.sql` to fix the issue
3. **Test**: Try registering and logging in

### Common Issues

- **"Database error saving new user"**: Run `lib/fix-registration.sql` to fix the trigger
- **Profile not created**: The fix script creates profiles for existing users automatically
- **Role not set**: Make sure the role is being passed correctly from the registration form
- **Profile page not loading**: The profile page now has better error handling

### Quick Fix Steps

1. **Run the fix script**: Execute `lib/fix-registration.sql` in your Supabase SQL editor
2. **Clear browser cache**: Clear your browser cache and try again
3. **Test registration**: Try registering with a new email address
4. **Check profile page**: Visit `/profile` after logging in

## 8. Production Deployment

1. Update environment variables with production Supabase project
2. Update redirect URLs in Supabase dashboard
3. Configure custom domain if needed
4. Set up proper CORS settings

## Notes

- The authentication system supports email/password and OAuth providers
- Articles are stored in Supabase with proper RLS policies
- Comments are linked to articles and users
- The system supports different user roles (reader, writer, editor, admin)
- All authentication state is managed through Supabase Auth
