# Build and Deployment Instructions

## Quick Start - Local Development

### 1. Install Dependencies

```bash
cd canuck-dentist
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-random-secret-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
VITE_APP_TITLE=Canuck Dentist
VITE_APP_LOGO=https://your-domain.com/logo.png
```

### 3. Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Building for Production

### 1. Build the Application

```bash
pnpm build
```

This command:
- Compiles TypeScript
- Bundles client-side code with Vite
- Bundles server-side code with esbuild
- Generates optimized production build

### 2. Test Production Build Locally

```bash
pnpm start
```

This runs the production-optimized build locally for testing.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Push code to GitHub:
```bash
git push origin main
```

2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables
6. Click "Deploy"

### Option 3: Deploy via Git Push (If Connected)

```bash
git push origin main
# Vercel will automatically deploy
```

## Vercel Configuration

The project includes a `vercel.json` configuration file that specifies:

- Build command: `pnpm build`
- Start command: `pnpm start`
- Output directory: `dist`
- Environment variables

## Database Migration for Production

### 1. Push Schema to Production Database

```bash
# Generate migrations
pnpm db:push

# This will:
# - Generate migration files
# - Apply migrations to your Supabase database
```

### 2. Initialize Clinic Data

After deployment, initialize your clinic settings and dentists:

```bash
# Connect to your Supabase database via SQL editor and run:
INSERT INTO clinic_settings (clinic_name, working_days, working_hours_start, working_hours_end)
VALUES ('Canuck Dentist', '1,2,3,4,5', '09:30', '17:30');

INSERT INTO dentists (full_name, specialization, is_active)
VALUES ('Dr. John Smith', 'General Dentistry', true);
```

## Environment Variables for Production

Set these in Vercel project settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `TWILIO_ACCOUNT_SID` | From Twilio Console |
| `TWILIO_AUTH_TOKEN` | From Twilio Console |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |
| `VITE_APP_TITLE` | Canuck Dentist |
| `VITE_APP_LOGO` | URL to your logo |

## Vercel Project Setup

### 1. Create Vercel Project

```bash
vercel link
# Follow prompts to link to your Vercel project
```

### 2. Configure Build Settings

In Vercel Dashboard:
- Framework Preset: Other
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
VITE_APP_TITLE=Canuck Dentist
VITE_APP_LOGO=...
```

## Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database is initialized with schema
- [ ] Clinic settings are configured
- [ ] At least one dentist is added
- [ ] Twilio credentials are verified
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Monitoring and logging are enabled

## Monitoring Deployment

### View Deployment Logs

```bash
# Via Vercel CLI
vercel logs

# Or visit Vercel Dashboard → Deployments → Logs
```

### Check Application Health

1. Visit your deployed URL
2. Test the booking flow
3. Check admin dashboard
4. Verify SMS notifications

## Rollback to Previous Deployment

If something goes wrong:

```bash
# Via Vercel CLI
vercel rollback

# Or use Vercel Dashboard → Deployments → Rollback
```

## Continuous Deployment

The project is configured for continuous deployment:

1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Deployment status visible in GitHub PR

To disable auto-deploy:
- Vercel Dashboard → Settings → Git → Auto-deploy: Off

## Performance Optimization

### 1. Enable Caching

Vercel automatically caches:
- Static assets (images, CSS, JS)
- API responses (with appropriate headers)

### 2. Database Query Optimization

- Add indexes to frequently queried columns
- Use connection pooling for database
- Monitor slow queries in Supabase

### 3. Frontend Optimization

- Code splitting is automatic with Vite
- Images are optimized automatically
- CSS is minified in production

## Troubleshooting Deployment

### Build Fails

```bash
# Check for TypeScript errors
pnpm check

# Check for build errors
pnpm build

# View detailed build logs in Vercel Dashboard
```

### Application Won't Start

1. Check environment variables are set
2. Verify database connection string
3. Check server logs: `vercel logs`
4. Ensure all dependencies are installed

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check Supabase project is active
3. Ensure IP whitelist allows Vercel IPs
4. Test connection locally first

### SMS Not Working

1. Verify Twilio credentials
2. Check Twilio phone number is active
3. Ensure webhook URL is correct
4. Check Twilio logs for errors

## Scaling Considerations

### For High Traffic

1. **Database**: Upgrade Supabase plan
2. **CDN**: Use Vercel's edge network
3. **Caching**: Implement Redis for session storage
4. **Rate Limiting**: Configure in API routes

### Cost Optimization

1. Monitor Vercel usage
2. Optimize database queries
3. Use serverless functions efficiently
4. Archive old appointment data

## Backup and Recovery

### Automated Backups

Supabase provides automatic daily backups. Access them:
1. Supabase Dashboard → Settings → Backups
2. Download backup if needed

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Check Supabase documentation: https://supabase.com/docs
- Check Twilio documentation: https://www.twilio.com/docs
