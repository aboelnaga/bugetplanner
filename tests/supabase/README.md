# Supabase Test Files

This directory contains test files and SQL scripts used for debugging and testing Supabase functionality.

## Test Scripts

### `test-signup.js`
- Tests signup with user metadata (full_name)
- Used to reproduce the original 500 error

### `test-simple-signup.js`
- Tests signup without any metadata
- Used to isolate the problem

### `test-final-signup.js`
- Tests signup and manual profile/account creation
- Confirms the fix works

### `diagnose-signup-issue.js`
- Diagnostic script to check database state
- Lists tables and their RLS policies

### `check-remote-schema.js`
- Checks if key tables exist in remote database
- Verifies schema completeness

### `check-triggers.js`
- Checks for triggers on auth.users table
- Diagnoses trigger-related issues

### `check-accounts-trigger.js`
- Specifically checks accounts table triggers
- Used to identify trigger conflicts

### `check-fix-status.js`
- Checks if fix has been applied
- Verifies trigger removal

## SQL Scripts

### `fix-signup-issue.sql`
- Original fix attempt for signup 500 error
- Creates profile trigger and RLS policies

### `simple-fix.sql`
- Simplified fix focusing only on profile creation
- Removes account creation temporarily

### `add-accounts-back.sql`
- Re-adds account creation functionality
- Creates separate trigger for accounts

### `combined-trigger-fix.sql`
- Combines profile and account creation in single trigger
- Attempts to avoid trigger conflicts

### `disable-rls-temporarily.sql`
- Temporarily disables RLS for testing
- Tests if RLS was causing the issue

### `check-triggers.sql`
- Lists all triggers on auth.users table
- Diagnostic script for trigger analysis

### `remove-trigger-test.sql`
- Removes all triggers and functions
- Creates manual function for testing

### `fix-accounts-trigger.sql`
- Attempts to fix accounts table trigger
- Includes RLS policy updates

### `fix-accounts-trigger-clean.sql`
- Cleaner version of accounts trigger fix
- Includes proper error handling

### `fix-rls-policies.sql`
- Updates RLS policies for profiles and accounts
- Ensures proper access control

### `fix-trigger-bypass.sql`
- Attempts to bypass trigger issues
- Uses different approach to user creation

### `drop_budget_amounts_table.sql`
- Utility script to drop budget_amounts table
- Used for schema cleanup

## Usage

To run a test:
```bash
node tests/supabase/test-final-signup.js
```

To apply a SQL fix:
1. Copy the SQL content
2. Paste in Supabase SQL Editor
3. Execute the script

## Root Cause

The 500 error during signup was caused by **conflicting triggers** on the `auth.users` table. The solution was to **remove all triggers** and handle profile/account creation manually or through the application layer.

## Current Status

✅ **Signup works** without 500 errors
✅ **Manual profile creation** works
✅ **Manual account creation** works
✅ **RLS policies** working correctly

## Solution Applied

The final solution was to remove all triggers from `auth.users` table using the `remove-trigger-test.sql` script. This eliminates the 500 error while maintaining all functionality through manual creation or application-level handling. 