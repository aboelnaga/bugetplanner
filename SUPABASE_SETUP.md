# Supabase Setup Guide for Budget Planner

## 🚀 Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Note your project URL and anon key

### 2. Set Environment Variables
Create a `.env` file in your project root:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema-simple.sql`
4. Run the SQL to create tables, policies, and functions
5. If you get permission errors, use the simplified schema which removes admin-only operations

### 4. Configure Authentication
1. Go to Authentication > Settings
2. Configure your site URL and redirect URLs
3. Enable email confirmations if desired
4. Set up social providers (Google, GitHub) if needed

## 📊 Database Schema

### Tables Created:
- **profiles**: User profile information
- **budget_items**: Main budget item data
- **budget_amounts**: Monthly amounts for each budget item
- **budget_history**: Track changes to budget amounts

### Key Features:
- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic triggers**: Profile creation and change tracking
- **Database functions**: Yearly and monthly calculations
- **Real-time subscriptions**: Live updates across clients

## 🔧 MCP Integration

### Using Supabase MCP in Cursor:
1. The MCP is configured in `.cursor/mcp.json`
2. Set your Supabase access token and project ID
3. Use MCP commands to manage your database

### Available MCP Commands:
- Database schema management
- Real-time subscription setup
- Authentication configuration
- API endpoint generation

## 🔐 Security Features

### Row Level Security Policies:
- Users can only view/edit their own budget items
- Automatic user isolation
- Secure data access patterns

### Authentication:
- JWT-based authentication
- Social login support
- Email/password authentication
- Session management

## 📱 Frontend Integration

### Key Files:
- `src/lib/supabase.js`: Supabase client and API functions
- `src/stores/auth.js`: Authentication state management
- `src/views/BudgetPlanner.vue`: Main budget planner with Supabase integration

### Features:
- Real-time budget updates
- Offline support with sync
- Optimistic UI updates
- Error handling and loading states

## 🚀 Next Steps

1. **Set up your Supabase project** using the steps above
2. **Update environment variables** with your project details
3. **Run the database schema** in Supabase SQL Editor
4. **Test the integration** by creating a budget item
5. **Enable real-time features** for live updates

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Supabase CLI commands (if installed globally)
supabase start
supabase db reset
supabase db push
```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vue.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-vue-3)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime) 