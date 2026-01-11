# Canuck Dentist - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Canuck Dentist appointment booking system to Vercel with Supabase as the database backend and Twilio for SMS notifications.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at https://vercel.com
2. **Supabase Account** - Sign up at https://supabase.com
3. **Twilio Account** - Sign up at https://www.twilio.com
4. **GitHub Account** - For connecting your repository to Vercel
5. **Node.js 18+** - Installed locally for development

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Enter project details:
   - Name: `canuck-dentist`
   - Database Password: Create a strong password
   - Region: Select closest to your users
4. Wait for project initialization (5-10 minutes)

### 1.2 Create Database Tables

Once your project is ready:

1. Go to the SQL Editor in Supabase
2. Create the following tables:

```sql
-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dentists table
CREATE TABLE IF NOT EXISTS dentists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  specialization TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_time TIMESTAMPTZ NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'finished') DEFAULT 'pending',
  reason TEXT,
  phone_number VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Time slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date_time TIMESTAMPTZ NOT NULL,
  dentist_id UUID NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  is_booked BOOLEAN DEFAULT false,
  appointment_id UUID REFERENCES appointments(id),
  UNIQUE(slot_date_time, dentist_id)
);

-- Clinic settings table
CREATE TABLE IF NOT EXISTS clinic_settings (
  id SERIAL PRIMARY KEY,
  clinic_name TEXT NOT NULL,
  working_days TEXT NOT NULL, -- e.g., "1,2,3,4,5" for Mon-Fri
  working_hours_start VARCHAR(5) NOT NULL, -- e.g., "09:30"
  working_hours_end VARCHAR(5) NOT NULL, -- e.g., "17:30"
  slot_duration_minutes INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.3 Get Connection String

1. In Supabase, go to Settings → Database
2. Copy the "Connection string" (URI format)
3. Save this for later - you'll need it for environment variables

## Step 2: Set Up Twilio

### 2.1 Get Twilio Credentials

1. Go to https://www.twilio.com and sign in
2. Go to Console → Account Info
3. Copy your:
   - Account SID
   - Auth Token
4. Go to Phone Numbers → Manage Numbers
5. Get your Twilio phone number (or purchase one)

### 2.2 Set Up Webhook for SMS Replies

1. Go to Phone Numbers → Manage Numbers
2. Click on your number
3. Under "Messaging", set "A Message Comes In" webhook to:
   ```
   https://your-vercel-domain.vercel.app/api/webhooks/twilio
   ```
4. Method: POST

## Step 3: Prepare GitHub Repository

### 3.1 Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Canuck Dentist booking system"

# Add your GitHub repository
git remote add origin https://github.com/yourusername/canuck-dentist.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### 4.1 Connect Repository

1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Select "Import Git Repository"
4. Paste your GitHub repository URL
5. Click "Import"

### 4.2 Configure Environment Variables

In the Vercel project settings, add the following environment variables:

```
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-jwt-secret-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
VITE_APP_TITLE=Canuck Dentist
VITE_APP_LOGO=https://your-domain.com/logo.png
```

### 4.3 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (5-10 minutes)
3. Your application will be available at `https://your-project.vercel.app`

## Step 5: Post-Deployment Setup

### 5.1 Initialize Clinic Settings

Connect to your Supabase database and insert default clinic settings:

```sql
INSERT INTO clinic_settings (clinic_name, working_days, working_hours_start, working_hours_end, slot_duration_minutes)
VALUES ('Canuck Dentist', '1,2,3,4,5', '09:30', '17:30', 60);
```

### 5.2 Add Dentists

Add your dentists to the system:

```sql
INSERT INTO dentists (full_name, specialization, is_active)
VALUES 
  ('Dr. John Smith', 'General Dentistry', true),
  ('Dr. Sarah Johnson', 'Orthodontics', true),
  ('Dr. Michael Brown', 'Cosmetic Dentistry', true);
```

### 5.3 Initialize Time Slots

Run the time slot initialization script (to be executed once):

```bash
# This script will generate time slots for the next 2 years
# Based on clinic working days and hours
node scripts/init-time-slots.mjs
```

## Step 6: Configure Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Twilio webhook URL with your custom domain

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret for JWT signing | Generate a random 32+ char string |
| `TWILIO_ACCOUNT_SID` | Twilio account ID | From Twilio console |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | From Twilio console |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number | `+1234567890` |
| `VITE_APP_TITLE` | Application title | `Canuck Dentist` |
| `VITE_APP_LOGO` | Logo URL | `https://example.com/logo.png` |

## Monitoring & Maintenance

### 1. Monitor Deployment

- Check Vercel Dashboard for deployment status
- Monitor logs in Vercel → Deployments → Logs
- Check Supabase Dashboard for database health

### 2. Database Backups

Supabase automatically backs up your database. To manually backup:

1. Go to Supabase Dashboard
2. Settings → Backups
3. Click "Request backup"

### 3. Update Time Slots

Run the time slot initialization periodically to add future slots:

```bash
node scripts/init-time-slots.mjs --extend
```

## Troubleshooting

### SMS Not Sending

1. Check Twilio credentials in environment variables
2. Verify Twilio phone number is active
3. Check Twilio logs for errors
4. Ensure phone numbers are in E.164 format (+1234567890)

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check Supabase project is active
3. Ensure IP whitelist allows Vercel IPs
4. Check database user has correct permissions

### Deployment Failures

1. Check build logs in Vercel
2. Verify all environment variables are set
3. Ensure package.json scripts are correct
4. Check for TypeScript errors: `npm run check`

## Performance Optimization

1. **Enable Caching**
   - Vercel automatically caches static assets
   - Configure cache headers in `vercel.json`

2. **Database Optimization**
   - Add indexes to frequently queried columns
   - Monitor query performance in Supabase

3. **CDN Configuration**
   - Use Vercel's built-in CDN
   - Consider additional CDN for media files

## Security Checklist

- [ ] Environment variables are not committed to git
- [ ] Database password is strong (20+ characters)
- [ ] JWT_SECRET is randomly generated
- [ ] Twilio credentials are kept secret
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Admin dashboard requires authentication

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Twilio Docs**: https://www.twilio.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Next Steps

1. Test the booking system with test appointments
2. Configure SMS templates for appointment confirmations
3. Set up email notifications (optional)
4. Train staff on admin dashboard
5. Monitor system performance and user feedback
