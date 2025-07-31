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

### `simple-fix-for-signup-issue.sql`
- Simplified fix focusing only on profile creation
- Removes account creation temporarily

### `add-account-creation-back.sql`
- Re-adds account creation functionality
- Creates separate trigger for accounts

### `combined-trigger-fix.sql`
- Combines profile and account creation in single trigger
- Attempts to avoid trigger conflicts

### `rls-disabled-test.sql`
- Temporarily disables RLS for testing
- Tests if RLS was causing the issue

### `check-triggers-on-auth-users.sql`
- Lists all triggers on auth.users table
- Diagnostic script for trigger analysis

### `remove-all-triggers-test.sql`
- Removes all triggers and functions
- Creates manual function for testing

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