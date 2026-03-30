# Move Ready Plus - Supabase Setup Guide

## Problem
The app shows "failed to fetch" when entering credentials because the demo users don't exist in Supabase yet.

## Solution: Create Demo Users

You need to manually create the users in your Supabase project. Here's how:

### Option 1: Use Supabase Dashboard (Easiest)

1. **Go to your Supabase project**:
   - URL: https://app.supabase.com
   - Select your "move-ready" project

2. **Navigate to Authentication**:
   - Click "Authentication" in the left sidebar
   - Click "Users" tab

3. **Create first user (Dispatcher)**:
   - Click "Add user" button
   - **Email**: dispatcher@test.com
   - **Password**: TestPass123!
   - Click "Save user"

4. **Create second user (Manager)**:
   - Click "Add user" button
   - **Email**: manager@test.com
   - **Password**: TestPass123!
   - Click "Save user"

5. **Create third user (Driver)**:
   - Click "Add user" button
   - **Email**: driver@test.com
   - **Password**: TestPass123!
   - Click "Save user"

---

### Option 2: Use SQL (Faster)

1. **Go to your Supabase project SQL Editor**:
   - URL: https://app.supabase.com/project/{your-project-id}/sql/new

2. **Paste this SQL**:

```sql
-- Create demo users using Supabase auth functions
SELECT
  auth.uid(),
  email,
  role
FROM (
  SELECT 
    'dispatcher@test.com'::text as email,
    'dispatcher'::text as role
  UNION ALL
  SELECT 'manager@test.com'::text, 'manager'::text
  UNION ALL
  SELECT 'driver@test.com'::text, 'driver'::text
) users;

-- Then manually create users via Dashboard or use the API
```

3. **After users are created in Auth**, insert profiles via SQL Editor:

```sql
-- Insert profiles for demo users (AFTER users are created in Auth)
-- First, get the actual user IDs from auth.users table
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'dispatcher' FROM auth.users WHERE email = 'dispatcher@test.com'
UNION ALL
SELECT id, email, 'manager' FROM auth.users WHERE email = 'manager@test.com'
UNION ALL
SELECT id, email, 'driver' FROM auth.users WHERE email = 'driver@test.com'
ON CONFLICT (id) DO NOTHING;
```

---

### Option 3: Use Supabase API (Programmatic)

```bash
# Create dispatcher user
curl -X POST https://YOUR_PROJECT_ID.supabase.co/auth/v1/admin/users \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dispatcher@test.com",
    "password": "TestPass123!",
    "email_confirm": true
  }'

# Create manager user
curl -X POST https://YOUR_PROJECT_ID.supabase.co/auth/v1/admin/users \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "TestPass123!",
    "email_confirm": true
  }'

# Create driver user
curl -X POST https://YOUR_PROJECT_ID.supabase.co/auth/v1/admin/users \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.com",
    "password": "TestPass123!",
    "email_confirm": true
  }'
```

---

## Verification Steps

After creating the users:

1. **Check auth.users table**:
   - Go to SQL Editor in Supabase
   - Run: `SELECT email, created_at FROM auth.users;`
   - Should see 3 users

2. **Check profiles table**:
   - Run: `SELECT email, role FROM public.profiles;`
   - Should see 3 profiles with dispatcher/manager/driver roles

3. **Test login**:
   - Go to: https://move-ready.vercel.app/login
   - Try: dispatcher@test.com / TestPass123!
   - Should redirect to dashboard ✅

---

## If You Get "User Already Exists"

The users might already exist. Try logging in first. If login still fails:

1. Delete old users from Supabase (if duplicates exist)
2. Or use different email addresses:
   - dispatcher2@test.com
   - manager2@test.com
   - driver2@test.com

---

## Troubleshooting

### "Invalid login credentials"
- Check that profiles table has an entry for each user
- Profile email must match auth user email exactly
- Check that role is one of: dispatcher, manager, driver

### "User does not exist"
- The auth user hasn't been created yet
- Use Supabase Dashboard to create manually

### "Unauthorized" after login
- The profile record is missing
- Run the SQL insert statement for profiles

---

## Next Steps

1. ✅ Create the 3 demo users in Supabase Auth
2. ✅ Insert their profiles in public.profiles table
3. ✅ Test login at https://move-ready.vercel.app/login
4. ✅ Verify dark mode and dashboard load
5. ✅ Your app is ready!

---

**Need help?** Check Supabase docs: https://supabase.com/docs/guides/auth
