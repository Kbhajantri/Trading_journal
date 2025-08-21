# Supabase Setup Instructions

## 1. Database Setup

### Run the Migration
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the migration

**Note**: 
- If you encounter a permission error about `app.jwt_secret`, you can safely ignore it. This parameter is automatically managed by Supabase and doesn't need to be set manually.
- If you encounter errors about policies or triggers already existing, the migration will handle this gracefully and skip creating duplicates.

This will create:
- `users` table (extends auth.users)
- `trading_journals` table
- Row Level Security (RLS) policies
- Triggers for automatic user creation and timestamp updates

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### How to get these values:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key
4. For the service role key, copy the service_role key (keep this secret)

## 3. Authentication Configuration

### Email Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email authentication
3. Configure email templates if needed
4. Set up redirect URLs for email confirmation

### Optional: Social Authentication
If you want to enable Google/Facebook login:
1. Go to Authentication > Providers
2. Configure the providers you want to use
3. Add the provider credentials

## 4. Row Level Security

The migration automatically sets up RLS policies that ensure:
- Users can only access their own data
- Users can only create/update/delete their own journals
- Unauthenticated users cannot access any data

## 5. Testing the Setup

1. Start your development server: `npm run dev`
2. Try to sign up with a new account
3. Check your email for confirmation
4. Sign in and create a trading journal
5. Verify that data is being saved to the database

## 6. Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Check that your environment variables are correct
   - Ensure the `.env.local` file is in the project root

2. **"RLS policy violation" error**
   - Make sure the user is authenticated
   - Check that the RLS policies were created correctly

3. **"User not found" error**
   - Verify that the trigger for user creation is working
   - Check the `users` table in your database

4. **Email confirmation not working**
   - Check your Supabase email settings
   - Verify redirect URLs are configured correctly

5. **"permission denied to set parameter app.jwt_secret" error**
   - This error can be safely ignored
   - The JWT secret is automatically managed by Supabase
   - Continue with the rest of the migration

6. **"policy already exists" or "trigger already exists" error**
   - The updated migration handles this gracefully
   - It will skip creating duplicates and continue
   - This is normal if you've run the migration before

### Database Queries for Debugging:

```sql
-- Check if users table exists
SELECT * FROM users LIMIT 5;

-- Check if trading_journals table exists
SELECT * FROM trading_journals LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';
SELECT * FROM pg_policies WHERE tablename = 'trading_journals';

-- Check triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%user%';
```

## 7. Security Notes

- Never expose your service role key in client-side code
- The anon key is safe to use in the browser
- RLS policies ensure data security at the database level
- All user data is automatically scoped to the authenticated user

## 8. Next Steps

After setup is complete:
1. Test all authentication flows
2. Verify data persistence
3. Test the trading journal functionality
4. Consider adding additional security measures if needed
