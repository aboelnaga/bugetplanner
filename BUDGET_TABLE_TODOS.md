# Budget Table with Month Closure - Implementation TODOs

## 🎯 Feature Overview
Implement a budget table that shows actual vs planned spending with smart defaults based on month closure status. Months are automatically closed 7 days after they end, with manual override capability.

## 📋 Implementation TODOs

### **Phase 1: Database & Backend Infrastructure** ✅ **COMPLETED**

#### **1.1 Database Schema** ✅
- [x] **Create `closed_months` table**
  ```sql
  CREATE TABLE closed_months (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
      closed_at TIMESTAMP DEFAULT NOW(),
      closed_by UUID REFERENCES auth.users(id),
      UNIQUE(user_id, year, month)
  );
  ```
- [x] **Add indexes** for performance
- [x] **Add RLS policies** for security
- [x] **Add comments** for documentation

#### **1.2 API Endpoints** ✅
- [x] **Add to budget API:**
  - [x] `closeMonth(userId, year, month)` - Manual month closure
  - [x] `getClosedMonths(userId, year)` - Get all closed months for year
  - [x] `isMonthClosed(userId, year, month)` - Check if specific month is closed
  - [x] `autoCloseMonth(userId, year, month)` - Auto-close month
- [x] **Add auto-closure check** to `getBudgetItems()` API
- [x] **Add error handling** for closure operations
- [x] **Add retry logic** for failed auto-closures

#### **1.3 Auto-Closure Logic** ✅
- [x] **Implement `checkAndAutoCloseMonths()` function**
  - [x] Check if current date is 7+ days into new month
  - [x] Identify previous month that should be auto-closed
  - [x] Call auto-close function if month not already closed
- [x] **Add to budget items API** - check on every request
- [x] **Add toaster notification** after successful auto-closure
- [x] **Add error handling** with retry option

#### **1.4 Budget Store Integration** ✅
- [x] **Add month closure functions to budget store**
  - [x] `closeMonth(year, month)`
  - [x] `getClosedMonths(year)`
  - [x] `isMonthClosed(year, month)`
- [x] **Update `fetchBudgetItems()` to handle auto-closure results**
- [x] **Add auto-closure notification handling**

### **Phase 2: Budget Table Component** ✅ **COMPLETED**

#### **2.1 Core Budget Table** ✅
- [x] **Enhance existing `BudgetTable.vue` component**
  - [x] Monthly columns (Jan-Dec) with month closure indicators
  - [x] Budget item rows with smart defaults
  - [x] Summary row with totals
- [x] **Implement smart defaults display logic:**
  - [x] Closed months: Show actual amounts
  - [x] Current month: Show planned (unless actual > planned)
  - [x] Future months: Show planned amounts
- [x] **Add responsive design** for desktop
- [x] **Add loading states** and error handling

#### **2.2 Month Headers** ✅
- [x] **Enhance month header display**
  - [x] Month name and year
  - [x] "Close Month" button (when applicable)
  - [x] Current month indicator
  - [x] Closed month indicator (✓ Closed)
- [x] **Implement button visibility logic:**
  - [x] Show only when month can be closed (7+ days after month end)
  - [x] Hide for current and future months
- [x] **Add month closure functionality** (confirmation dialog in Phase 3)

#### **2.3 Tooltips System** ✅
- [x] **Implement contextual tooltips:**
  - [x] **Closed month:** "Actual: 1,200 | Planned: 1,000 | Variance: +20%"
  - [x] **Current month:** "Planned: 1,000 | Actual so far: 600 | Remaining: 400"
  - [x] **Future month:** "Planned: 1,000 | Based on: Previous month average"
- [x] **Add tooltip positioning** and styling (cursor-help)
- [x] **Add accessibility** features (title attribute)

### **Phase 3: Month Closure UI** ✅ **COMPLETED**

#### **3.1 Close Month Workflow** ✅
- [x] **Create confirmation dialog component**
  - [x] "Are you sure you want to close [Month] [Year]?"
  - [x] Warning about data implications
  - [x] Confirm/Cancel buttons
- [x] **Implement manual closure logic**
  - [x] Call closeMonth API
  - [x] Show success/error messages
  - [x] Refresh budget data
- [x] **Add visual feedback** during closure process

#### **3.2 Auto-Closure Notifications** ✅
- [x] **Implement toaster system**
  - [x] Success message: "January 2024 has been automatically closed"
  - [x] Error message with retry option
  - [x] Auto-dismiss after 5 seconds
- [x] **Add notification queue** for multiple closures
- [x] **Add retry functionality** for failed closures

#### **3.3 Visual Indicators** ✅
- [x] **Add month status indicators:**
  - [x] Closed month: Subtle checkmark or "✓" icon
  - [x] Current month: Highlighted background or "Current" badge
  - [x] Future month: Normal styling
- [x] **Add color coding** for budget performance
  - [x] Green: Under budget
  - [x] Yellow: Within 10% of budget
  - [x] Red: Over budget

### **Phase 4: Integration & Polish** ✅ **COMPLETED**

#### **4.1 BudgetActionCenter Integration** ✅
- [x] **Update BudgetActionCenter** to respect month closure
- [x] **Add month closure status** to budget item calculations
- [x] **Update tooltips** to show closure status
- [x] **Add month closure indicators** to budget items

#### **4.2 Data Refresh Logic** ✅
- [x] **Implement smart data refresh:**
  - [x] Refresh only budget data (not full page)
  - [x] Preserve user's current view/scroll position
  - [x] Show loading indicator during refresh
- [x] **Add optimistic updates** for better UX
- [x] **Handle refresh conflicts** and race conditions

#### **4.3 Error Handling & Edge Cases** ✅
- [x] **Handle network errors** during closure
- [x] **Handle concurrent closure attempts**
- [x] **Handle invalid month/year combinations**
- [x] **Add fallback display** when data is unavailable
- [x] **Add data validation** for closure operations

### **Phase 5: Testing & Documentation**

#### **5.1 Testing Infrastructure**
- [ ] **Add date simulation utilities**
  - [ ] Mock current date for testing
  - [ ] Test auto-closure logic with different dates
  - [ ] Test manual closure workflow
- [ ] **Add unit tests** for closure logic
- [ ] **Add integration tests** for API endpoints
- [ ] **Add UI tests** for budget table interactions

#### **5.2 Documentation**
- [ ] **Add API documentation** for new endpoints
- [ ] **Add component documentation** for BudgetTable
- [ ] **Add user guide** for month closure feature
- [ ] **Add troubleshooting guide** for common issues

## 🎯 Success Criteria

### **Functional Requirements**
- [ ] Users can view budget table with actual vs planned spending
- [ ] Months are automatically closed 7 days after they end
- [ ] Users can manually close months after auto-closure period
- [ ] Smart defaults show appropriate amounts based on time period
- [ ] Tooltips provide contextual information
- [ ] Auto-closure notifications work correctly

### **Performance Requirements**
- [ ] Budget table loads in < 200ms
- [ ] Auto-closure check adds < 50ms to API calls
- [ ] Tooltips appear instantly on hover
- [ ] Data refresh doesn't cause page flicker

### **User Experience Requirements**
- [ ] Interface is intuitive and easy to understand
- [ ] Month closure process is clear and non-disruptive
- [ ] Error messages are helpful and actionable
- [ ] Visual indicators are subtle but informative

## 🚀 Implementation Order

### **Week 1: Foundation**
1. Database schema and API endpoints
2. Auto-closure logic and integration
3. Basic budget table component

### **Week 2: Core Features**
1. Smart defaults display logic
2. Month headers with close buttons
3. Tooltips system

### **Week 3: Polish & Integration**
1. Month closure UI and workflow
2. Auto-closure notifications
3. Visual indicators and styling

### **Week 4: Testing & Documentation**
1. Testing infrastructure and tests
2. Documentation and user guides
3. Bug fixes and final polish

## 🐛 Known Issues & Considerations

### **Technical Considerations**
- **Date handling:** Ensure proper timezone handling
- **Concurrency:** Handle multiple users closing same month
- **Performance:** Optimize queries for large datasets
- **Mobile:** Consider mobile experience for future

### **Edge Cases**
- **Year boundaries:** Handle December → January transitions
- **Leap years:** Ensure February 29th is handled correctly
- **Data migration:** Handle existing data when implementing
- **Network issues:** Graceful degradation when API calls fail

### **Future Enhancements**
- **Bulk operations:** Close multiple months at once
- **Advanced analytics:** Spending trends and insights
- **Export functionality:** Export budget data to CSV/Excel
- **Mobile app:** Native mobile experience 