# Banking Feature Implementation TODO

## Database Schema Changes

### 1. Create Accounts Table
- [x] Create `accounts` table with fields:
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
- [x] Add `account_id` field to existing `transactions` table
- [x] Add foreign key constraint to `accounts` table
- [x] Make `account_id` required (not nullable)

### 3. Default Data Setup
- [x] Create migration to add default accounts for existing users
- [x] Create Cash account with $0 starting balance
- [x] Create Checking account with $0 starting balance
- [x] Set Checking as default account

## Backend/Store Changes

### 4. Update Stores
- [x] Create new `accounts` store (Pinia)
- [x] Add account management methods (CRUD operations)
- [x] Add balance calculation methods
- [x] Update `transactions` store to handle account_id
- [x] Add methods to update account balances when transactions change

### 5. Supabase Integration
- [x] Update Supabase client to handle accounts table
- [x] Add RLS policies for accounts table
- [x] Update transaction operations to include account_id
- [x] Add real-time subscriptions for account balance updates

## Frontend Components

### 6. Account Management Components
- [x] Create `AccountCard.vue` component for displaying account info
- [ ] Create `AccountList.vue` component for listing all accounts
- [x] Create `AddAccountModal.vue` for adding new accounts
- [x] Create `EditAccountModal.vue` for editing account details
- [ ] Create `AccountBalance.vue` component for displaying balances

### 7. Banking Page
- [x] Create new `Banking.vue` view
- [x] Add route for banking page in router
- [x] Display all accounts with current balances
- [x] Show recent transactions for each account
- [x] Add account management interface
- [x] Add transaction functionality from account cards

### 8. Update Existing Components
- [x] Update `AddTransactionModal.vue` to include account selection
- [x] Update `EditTransactionModal.vue` to include account selection
- [x] Update `Transactions.vue` to show account information
- [x] Update `BudgetPlanner.vue` to show account balances
- [ ] Update `Dashboard.vue` to include account overview

## Transaction System Updates

### 9. Transaction Forms
- [x] Add account dropdown to transaction forms
- [x] Make account selection required
- [x] Add validation for account selection
- [x] Update transaction creation/editing logic

### 10. Balance Calculations
- [x] Implement real-time balance updates
- [x] Add balance validation (prevent negative balances for non-credit accounts)
- [x] Handle credit card available credit calculations
- [ ] Add balance history tracking

## UI/UX Enhancements

### 11. Account Selection UI
- [ ] Design account dropdown component
- [ ] Add account icons/colors for different types
- [ ] Show account balances in dropdown
- [ ] Add quick account switching

### 12. Balance Display
- [x] Add balance display in navigation/header
- [x] Show account balances in transaction lists
- [x] Add balance formatting (currency, colors for negative)
- [ ] Add balance change indicators

### 13. Banking Dashboard
- [x] Create account overview cards
- [ ] Add account balance charts (future enhancement)
- [x] Show account transaction history
- [x] Add quick actions (add transaction, transfer, etc.)

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
- [x] Decide on transfer implementation approach
- [x] Create transfer transaction type or separate transactions
- [x] Add transfer interface
- [x] Add transfer modal component
- [x] Implement transfer validation (prevent transfers to same account)
- [x] Add transfer confirmation and success feedback
- [x] Support account-to-account transfers
- [x] Support cash withdrawals and deposits
- [x] Create separate TransferModal component

### 19. Advanced Features
- [ ] Account statements (monthly summaries)
- [ ] Account balance charts and graphs
- [ ] Automatic fee calculations
- [ ] Interest calculations
- [ ] Payment due date tracking for credit cards
- [ ] Account archiving (instead of deletion)
- [ ] Account notes/description field
- [ ] Account categories (Personal, Business, Joint)
- [ ] Account search and filtering
- [ ] Account sorting options

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