# Supabase Database Setup Guide

This guide will help you set up a free Supabase database to store your campaign data persistently.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub (recommended)
4. Create a new organization

## Step 2: Create a New Project

1. Click "New Project"
2. Choose your organization
3. Enter project details:
   - **Name:** `chabadnf-backend`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
4. Click "Create new project"
5. Wait for setup to complete (2-3 minutes)

## Step 3: Get Your Project Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 4: Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Run this SQL to create the tables:

```sql
-- Create campaign_data table
CREATE TABLE campaign_data (
  id INTEGER PRIMARY KEY DEFAULT 1,
  goal INTEGER NOT NULL DEFAULT 1800000,
  raised INTEGER NOT NULL DEFAULT 950000,
  lastUpdated DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Insert initial campaign data
INSERT INTO campaign_data (id, goal, raised, lastUpdated) 
VALUES (1, 1800000, 950000, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Create dedications table
CREATE TABLE dedications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending')),
  phase INTEGER DEFAULT 1
);

-- Insert initial dedications data
INSERT INTO dedications (id, title, amount, status, phase) VALUES
(1, 'Campus Dedication', '$900,000', 'available', 1),
(7, 'Playground', '$300,000', 'available', 1),
(6, 'Soccer Field', '$300,000', 'sold', 1),
(3, 'Basketball Court', '$250,000', 'available', 1),
(2, 'Baseball Field', '$200,000', 'available', 1),
(4, 'Pickleball Court', '$180,000', 'available', 1),
(5, 'Kids Car Track', '$100,000', 'sold', 1),
(8, 'Nature Trail', '$100,000', 'available', 1),
(9, 'Nature Nest', '$75,000', 'available', 1),
(10, 'Water Slides', '$25,000', 'available', 1),
(11, 'Gazebos', '$25,000', 'available', 1),
(12, 'Bleachers', '$5,000', 'available', 1),
(13, 'Benches', '$3,600', 'available', 1),
(14, 'Retreat House', '$850,000', 'available', 2),
(15, 'Gym', '$4,000,000', 'available', 2);
```

## Step 5: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
Name: SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production, Preview, Development

Name: SUPABASE_ANON_KEY  
Value: your_anon_key_here
Environment: Production, Preview, Development
```

4. Click "Save" for each variable
5. Redeploy your project

## Step 6: Test the Setup

1. Deploy your updated backend
2. Test the API endpoints:
   ```bash
   curl https://your-backend-url.vercel.app/api/campaign-data
   curl https://your-backend-url.vercel.app/api/dedications
   ```

## Benefits of This Setup

✅ **Persistent data** - All users see the same data  
✅ **Real-time updates** - Changes appear immediately for everyone  
✅ **Free tier** - 500MB database, 50,000 monthly active users  
✅ **Automatic backups** - Daily backups included  
✅ **Scalable** - Can upgrade as needed  

## Troubleshooting

- **"Table doesn't exist" errors:** Make sure you ran the SQL commands
- **Connection errors:** Check your environment variables
- **Permission errors:** Make sure you're using the anon key, not the service role key

Your data will now persist across all serverless function instances! 🎉
