# Vercel Deployment Guide

## Environment Variables Setup

To deploy Move Ready Plus to Vercel, you **must** configure the following environment variables in your Vercel project settings.

### Required Environment Variables

Navigate to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zbiulljwpiwkljhtrulc.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your Supabase service role key (server-side only) |
| `GEOAPIFY_KEY` | `6498a2f07dc44a0bb0b33dee4da68b20` | Your Geoapify API key for maps |

### Important Notes

1. **DO NOT** use Vercel Secrets syntax in your environment variable values
   - ❌ Wrong: `$supabase_url` or `@supabase_url`
   - ✅ Correct: `https://zbiulljwpiwkljhtrulc.supabase.co`

2. **Environment Scope**: Set all variables for:
   - Production
   - Preview
   - Development

3. **Public vs Private Variables**:
   - Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
   - Variables without the prefix are server-side only

## Deployment Steps

### 1. Connect Repository

```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project in Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `RalHill/Move-Ready`
4. Vercel will auto-detect Next.js configuration

### 3. Configure Environment Variables

Before deploying, add all environment variables listed above in:
**Settings → Environment Variables**

### 4. Deploy

Click "Deploy" - Vercel will:
- Install dependencies
- Run `npm run build`
- Deploy to production

### 5. Post-Deployment

After successful deployment:
- Visit your production URL
- Test authentication with Supabase
- Verify dark mode toggle works
- Check real-time updates function

## Troubleshooting

### Error: "Environment Variable references Secret which does not exist"

**Cause**: You're using Vercel Secrets syntax incorrectly

**Fix**: 
1. Go to Settings → Environment Variables
2. Delete any variables with values like `$secret_name` or `@secret_name`
3. Re-add them with actual values (URLs, keys, etc.)

### Error: "Supabase client initialization failed"

**Cause**: Missing or incorrect Supabase environment variables

**Fix**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
3. Check Supabase dashboard to confirm values match

### Build Fails

**Check**:
1. All required environment variables are set
2. No TypeScript errors locally: `npm run build`
3. All dependencies are in `package.json`

## Local Development Sync

To keep local development in sync with Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables from Vercel
vercel env pull .env.local
```

This creates a `.env.local` file with your Vercel environment variables.

## Production URLs

After deployment, your app will be available at:
- **Production**: `https://move-ready.vercel.app` (or your custom domain)
- **Preview**: Automatic preview URLs for each PR

## Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Rotate keys** if accidentally exposed
3. **Use RLS policies** in Supabase to secure data
4. **Service role key** should only be used in server-side API routes

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure Vercel Analytics
3. Set up monitoring/alerts
4. Enable automatic deployments for main branch
