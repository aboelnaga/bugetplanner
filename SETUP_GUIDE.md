# 🚀 Budgrt Setup Guide - Next Steps

## 📋 Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account

## 🔧 Step-by-Step Setup

### 1. **Create Supabase Project**

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `budgrt` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### 2. **Get Project Credentials**

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

### 3. **Set Up Environment Variables**

1. Create a `.env` file in your project root:
```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the placeholder values with your actual Supabase credentials

### 4. **Set Up Database Schema**

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/schema-simple.sql`
4. Click "Run" to execute the SQL
5. Verify the tables are created in **Table Editor**

### 5. **Configure Authentication**

1. Go to **Authentication** → **Settings**
2. Set your site URL:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`
4. (Optional) Configure Google OAuth:
   - Go to **Authentication** → **Providers**
   - Enable Google provider
   - Add your Google OAuth credentials

### 6. **Install Dependencies**

```bash
npm install
```

### 7. **Start Development Server**

```bash
npm run dev
```

### 8. **Test the Application**

1. Open `http://localhost:3000`
2. You should be redirected to the login page
3. Create a new account or sign in
4. Test the budget planner functionality

## 🔄 Data Migration

### Option 1: Use Migration Script (Recommended)

1. After signing in for the first time, open browser console
2. Run the migration script:
```javascript
import { migrateBudgetData } from '@/lib/migration.js'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
await migrateBudgetData(authStore.userId)
```

### Option 2: Manual Data Entry

1. Use the budget planner interface to add your budget items
2. The data will be automatically saved to Supabase

## 🧪 Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works (if configured)
- [ ] Budget items can be created
- [ ] Budget items can be edited
- [ ] Monthly amounts can be modified
- [ ] Data persists after page refresh
- [ ] Real-time updates work (open in multiple tabs)

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check your `.env` file has correct values
   - Restart the development server

2. **"Table doesn't exist" error**
   - Run the schema SQL again
   - Check table names match exactly

3. **Authentication not working**
   - Verify redirect URLs in Supabase settings
   - Check browser console for errors

4. **CORS errors**
   - Add your localhost URL to Supabase allowed origins
   - Go to **Settings** → **API** → **CORS**

### Getting Help

1. Check browser console for error messages
2. Check Supabase dashboard logs
3. Verify all environment variables are set
4. Ensure database schema is properly created

## 🚀 Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy

### Environment Variables for Production

```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 📊 Next Features to Implement

1. **Real-time Collaboration**
   - Share budgets with family members
   - Real-time updates across devices

2. **Data Export/Import**
   - Export budget data to CSV/Excel
   - Import from existing spreadsheets

3. **Advanced Analytics**
   - Spending trends analysis
   - Budget vs actual comparisons
   - Financial goal tracking

4. **Mobile App**
   - React Native or Flutter app
   - Offline support
   - Push notifications

5. **Integration Features**
   - Bank account integration
   - Receipt scanning
   - Automatic categorization

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to git
   - Use different keys for development/production

2. **Row Level Security**
   - All tables have RLS enabled
   - Users can only access their own data

3. **Authentication**
   - Use strong passwords
   - Enable 2FA if available
   - Regular security audits

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check Vue.js and Vite documentation
4. Create an issue in the project repository

---

**Happy Budgeting! 🎉** 