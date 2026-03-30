# ⚠️ ACTION REQUIRED: Create Demo Users in Supabase

## The Issue
Your app shows **"failed to fetch"** or **"Invalid login credentials"** because the demo user accounts don't exist in Supabase yet.

---

## Quick Fix (5 minutes)

### Step 1: Go to Supabase Dashboard
- URL: https://app.supabase.com
- Select your **move-ready** project

### Step 2: Navigate to Auth Users
1. Click **"Authentication"** in left sidebar
2. Click **"Users"** tab
3. You should see an empty users list

### Step 3: Create 3 Demo Users

**User #1 - Dispatcher**
- Click **"Add user"** 
- Email: `dispatcher@test.com`
- Password: `TestPass123!`
- Click **"Save user"**

**User #2 - Manager**
- Click **"Add user"**
- Email: `manager@test.com`
- Password: `TestPass123!`
- Click **"Save user"**

**User #3 - Driver**
- Click **"Add user"**
- Email: `driver@test.com`
- Password: `TestPass123!`
- Click **"Save user"**

### Step 4: Create Profiles (Required)
1. Go to **"SQL Editor"** in Supabase
2. Copy & paste this SQL:

```sql
-- Insert profiles for demo users
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'dispatcher' 
FROM auth.users 
WHERE email = 'dispatcher@test.com'
ON CONFLICT (id) DO UPDATE SET role = 'dispatcher'
UNION ALL
SELECT id, email, 'manager' 
FROM auth.users 
WHERE email = 'manager@test.com'
ON CONFLICT (id) DO UPDATE SET role = 'manager'
UNION ALL
SELECT id, email, 'driver' 
FROM auth.users 
WHERE email = 'driver@test.com'
ON CONFLICT (id) DO UPDATE SET role = 'driver';
```

3. Click **"Run"** button
4. Wait for success message

---

## Verify It Works

1. Go to: https://move-ready.vercel.app/login
2. Try logging in:
   - Email: `dispatcher@test.com`
   - Password: `TestPass123!`
3. Should redirect to dashboard ✅

---

## Alternative: Create User in SQL Editor

If the Dashboard "Add user" button doesn't work:

```sql
-- Create users via stored procedure (if available in your Supabase)
-- Otherwise, use the Dashboard method above
```

---

## Troubleshooting

### ❌ "User already exists"
- Users might be leftover from previous attempts
- That's OK - just skip that user and create the others
- Or try a different email: dispatcher2@test.com

### ❌ "Invalid login credentials" (after user created)
- The profile record is missing
- Run the SQL from Step 4 above to create profiles

### ❌ "Unauthorized" (after logging in)
- The role is wrong in profiles table
- Check: `SELECT email, role FROM public.profiles;`
- Role must be one of: dispatcher, manager, driver

### ❌ Still "failed to fetch"?
- Check browser DevTools (F12) → Network tab
- Look for failed API calls
- Check Supabase project Settings for CORS issues
- Verify environment variables: https://move-ready.vercel.app (should show no console errors)

---

## What Just Happened?

- **Auth users created**: In `auth.users` table (managed by Supabase)
- **Profiles created**: In `public.profiles` table (your app's user data)
- **Roles assigned**: dispatcher/manager/driver for role-based access control
- **Authentication flow**: Now works! App can validate credentials and authorize access

---

## You're All Set! 🎉

After completing these steps:
1. ✅ Login works with demo credentials
2. ✅ App redirects to dashboard
3. ✅ Dark mode toggle works
4. ✅ All features available

**Questions?** See: `SUPABASE_SETUP.md` in your project

---

**Last updated**: 2026-03-30
