# Complete Database Setup Guide

## 1. Supabase Project Setup

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `gov-schemes-app` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

### Step 2: Get Your Credentials
1. Go to Settings > API in your Supabase dashboard
2. Copy these values:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

### Step 3: Create .env.local File
Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 2. Database Schema Setup

### Step 1: Run the Initial Migration
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click "Run" to execute

### Step 2: Create Additional Database Functions
Run this SQL to create the missing functions:

```sql
-- Function to get trading journals by email
CREATE OR REPLACE FUNCTION get_trading_journals_by_email(user_email TEXT)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    month INTEGER,
    year INTEGER,
    start_date DATE,
    starting_capital DECIMAL(15,2),
    week_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_email TEXT,
    user_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tj.id,
        tj.user_id,
        tj.month,
        tj.year,
        tj.start_date,
        tj.starting_capital,
        tj.week_data,
        tj.created_at,
        tj.updated_at,
        u.email as user_email,
        u.name as user_name
    FROM trading_journals tj
    INNER JOIN users u ON tj.user_id = u.id
    WHERE u.email = user_email
    ORDER BY tj.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all trading journals with email
CREATE OR REPLACE FUNCTION get_all_trading_journals_with_email()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    month INTEGER,
    year INTEGER,
    start_date DATE,
    starting_capital DECIMAL(15,2),
    week_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_email TEXT,
    user_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tj.id,
        tj.user_id,
        tj.month,
        tj.year,
        tj.start_date,
        tj.starting_capital,
        tj.week_data,
        tj.created_at,
        tj.updated_at,
        u.email as user_email,
        u.name as user_name
    FROM trading_journals tj
    INNER JOIN users u ON tj.user_id = u.id
    ORDER BY tj.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_trading_journals_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_trading_journals_with_email() TO authenticated;
```

## 3. Authentication Setup

### Step 1: Enable Email Authentication
1. Go to Authentication > Settings in Supabase dashboard
2. Enable "Enable email confirmations"
3. Configure email templates if needed
4. Set redirect URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### Step 2: Test Authentication
1. Start your app: `npm run dev`
2. Try to sign up with a new email
3. Check your email for confirmation
4. Sign in to test

## 4. Journal Deletion Functionality

The journal deletion is already implemented in your `database.ts` file:

```typescript
// Delete a trading journal
async deleteTradingJournal(journalId: string) {
  const { error } = await supabase
    .from('trading_journals')
    .delete()
    .eq('id', journalId);
  
  return { error };
}
```

### How Deletion Works:
1. **User clicks delete** → Confirmation dialog appears
2. **User confirms** → `deleteTradingJournal()` function is called
3. **Database deletion** → Row is removed from `trading_journals` table
4. **RLS Policy** → Ensures users can only delete their own journals
5. **Cascade deletion** → If you have related tables, they're also cleaned up

## 5. Testing the Setup

### Test Database Connection:
1. Create a test user account
2. Create a trading journal
3. Verify data appears in Supabase dashboard
4. Delete the journal
5. Verify data is removed from database

### Test RLS Policies:
1. Try to access another user's data (should fail)
2. Try to delete another user's journal (should fail)
3. Verify only own data is accessible

## 6. Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Check your `.env.local` file
   - Ensure no extra spaces in values
   - Restart your dev server after changes

2. **"RLS policy violation" error**
   - Make sure user is authenticated
   - Check RLS policies in Supabase dashboard
   - Verify user_id matches auth.uid()

3. **"Function not found" error**
   - Run the SQL functions creation script
   - Check function permissions

4. **"Table not found" error**
   - Run the initial migration
   - Check table names match exactly

### Debug Queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'trading_journals';

-- Check functions
SELECT * FROM pg_proc WHERE proname LIKE '%trading%';

-- Check user data
SELECT * FROM users LIMIT 5;
SELECT * FROM trading_journals LIMIT 5;
```

## 7. Security Features

Your setup includes:
- ✅ Row Level Security (RLS)
- ✅ User authentication
- ✅ Data isolation per user
- ✅ Secure API keys
- ✅ Automatic user creation
- ✅ Timestamp tracking

## 8. Next Steps

After setup:
1. Test all CRUD operations
2. Verify data persistence
3. Test user authentication flows
4. Monitor database performance
5. Set up backups if needed

## 9. Production Considerations

When deploying:
1. Use production Supabase project
2. Set up custom domains
3. Configure production redirect URLs
4. Set up monitoring and alerts
5. Consider database backups
