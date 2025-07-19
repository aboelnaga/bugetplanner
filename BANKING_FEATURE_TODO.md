# Banking Feature Implementation TODO

## Database Schema Changes

### 1. Create Accounts Table
- [ ] Create `accounts` table with fields:
  - `id` (primary key)
  - `name` (account name)
  - `type` (checking, savings, credit_card, cash)
  - `balance` (current balance)
  - `credit_limit` (for credit cards, nullable)
  - `is_default` (boolean, default false)
  - `user_id` (foreign key to auth.users)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### 2. Update Transactions Table
- [ ] Add `account_id` field to existing `transactions` table
- [ ] Add foreign key constraint to `accounts` table
- [ ] Make `account_id` required (not nullable)

### 3. Default Data Setup
- [ ] Create migration to add default accounts for existing users
- [ ] Create Cash account with $0 starting balance
- [ ] Create Checking account with $0 starting balance
- [ ] Set Checking as default account

## Backend/Store Changes

### 4. Update Stores
- [ ] Create new `accounts` store (Pinia)
- [ ] Add account management methods (CRUD operations)
- [ ] Add balance calculation methods
- [ ] Update `transactions` store to handle account_id
- [ ] Add methods to update account balances when transactions change

### 5. Supabase Integration
- [ ] Update Supabase client to handle accounts table
- [ ] Add RLS policies for accounts table
- [ ] Update transaction operations to include account_id
- [ ] Add real-time subscriptions for account balance updates

## Frontend Components

### 6. Account Management Components
- [ ] Create `AccountCard.vue` component for displaying account info
- [ ] Create `AccountList.vue` component for listing all accounts
- [ ] Create `AddAccountModal.vue` for adding new accounts
- [ ] Create `EditAccountModal.vue` for editing account details
- [ ] Create `AccountBalance.vue` component for displaying balances

### 7. Banking Page
- [ ] Create new `Banking.vue` view
- [ ] Add route for banking page in router
- [ ] Display all accounts with current balances
- [ ] Show recent transactions for each account
- [ ] Add account management interface

### 8. Update Existing Components
- [ ] Update `AddTransactionModal.vue` to include account selection
- [ ] Update `EditTransactionModal.vue` to include account selection
- [ ] Update `Transactions.vue` to show account information
- [ ] Update `BudgetPlanner.vue` to show account balances
- [ ] Update `Dashboard.vue` to include account overview

## Transaction System Updates

### 9. Transaction Forms
- [ ] Add account dropdown to transaction forms
- [ ] Make account selection required
- [ ] Add validation for account selection
- [ ] Update transaction creation/editing logic

### 10. Balance Calculations
- [ ] Implement real-time balance updates
- [ ] Add balance validation (prevent negative balances for non-credit accounts)
- [ ] Handle credit card available credit calculations
- [ ] Add balance history tracking

## UI/UX Enhancements

### 11. Account Selection UI
- [ ] Design account dropdown component
- [ ] Add account icons/colors for different types
- [ ] Show account balances in dropdown
- [ ] Add quick account switching

### 12. Balance Display
- [ ] Add balance display in navigation/header
- [ ] Show account balances in transaction lists
- [ ] Add balance formatting (currency, colors for negative)
- [ ] Add balance change indicators

### 13. Banking Dashboard
- [ ] Create account overview cards
- [ ] Add account balance charts (future enhancement)
- [ ] Show account transaction history
- [ ] Add quick actions (add transaction, transfer, etc.)

## Integration Features

### 14. Budget Integration
- [ ] Ensure transactions still work with budget categories
- [ ] Update budget calculations to consider account-specific transactions
- [ ] Add account filtering to budget views

### 15. Reconciliation Features
- [ ] Add expected vs actual balance display
- [ ] Create reconciliation interface (future enhancement)
- [ ] Add transaction matching tools (future enhancement)

## Testing & Validation

### 16. Data Migration
- [ ] Test migration for existing users
- [ ] Validate account creation for new users
- [ ] Test balance calculations
- [ ] Verify transaction integrity

### 17. User Experience Testing
- [ ] Test account creation flow
- [ ] Test transaction creation with accounts
- [ ] Test balance updates
- [ ] Test account switching

## Future Enhancements (Not in Initial Implementation)

### 18. Transfer System
- [ ] Decide on transfer implementation approach
- [ ] Create transfer transaction type or separate transactions
- [ ] Add transfer interface

### 19. Advanced Features
- [ ] Account statements (monthly summaries)
- [ ] Account balance charts and graphs
- [ ] Automatic fee calculations
- [ ] Interest calculations
- [ ] Payment due date tracking for credit cards

### 20. Mobile/Responsive
- [ ] Ensure banking features work on mobile
- [ ] Optimize account selection for touch devices
- [ ] Add mobile-specific account management

## Documentation

### 21. User Documentation
- [ ] Update README with banking features
- [ ] Add banking feature documentation
- [ ] Create user guide for account management

### 22. Code Documentation
- [ ] Document new components and stores
- [ ] Add JSDoc comments for new methods
- [ ] Update API documentation

## Deployment

### 23. Production Deployment
- [ ] Test migration in staging environment
- [ ] Deploy database changes
- [ ] Deploy frontend changes
- [ ] Monitor for any issues post-deployment

---

## Implementation Priority Order:
1. Database schema changes
2. Backend/store updates
3. Basic account management components
4. Transaction form updates
5. Banking page creation
6. UI/UX enhancements
7. Testing and validation
8. Documentation and deployment 