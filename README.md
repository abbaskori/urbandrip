# Urban Drift Luxury Showroom

A premium Luxury Showroom SPA featuring a dark glass-morphism design, built with Vite, Vanilla JS, and Supabase.

## Features
- Premium dark glass-morphism UI
- Responsive grid and micro-animations
- Admin portal with multi-file upload and Base64 preview
- Integration with Supabase for data and storage
- Ready for Vercel deployment

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Supabase Setup
Execute the SQL script located at `supabase/init.sql` in your Supabase project's SQL Editor to create the necessary tables, Row Level Security (RLS) policies, and triggers.

## Vercel Deployment

1. Connect your GitHub repository to Vercel.
2. In your Vercel project settings, navigate to **Environment Variables**.
3. Add the following variables (for Production environment):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy the project. The included `vercel.json` will handle SPA routing and caching.
