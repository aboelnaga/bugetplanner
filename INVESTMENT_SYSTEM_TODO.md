# Investment System Implementation TODO

## 🎯 **Phase 1: Core Investment Types** (Current Focus)

### **Database Schema Updates**
- [ ] Add new columns to `investment_assets` table:
  - [ ] `delivery_date` (DATE) - for real estate
  - [ ] `construction_status` (VARCHAR(50)) - under construction, finished
  - [ ] `completion_date` (DATE) - when construction finishes
  - [ ] `document_links` (JSONB) - array of document URLs
  - [ ] `developer_owner` (VARCHAR(255)) - real estate company/owner
  - [ ] `metal_type` (VARCHAR(50)) - gold, silver, platinum, etc.
  - [ ] `karat` (VARCHAR(20)) - 21K, 24K, 18K, etc.
  - [ ] `condition` (VARCHAR(20)) - new, used
  - [ ] `form` (VARCHAR(50)) - bars, jewelry, coins
  - [ ] `purpose` (VARCHAR(20)) - investment, personal use for zakat
  - [ ] `amount` (DECIMAL(10,4)) - quantity
  - [ ] `amount_unit` (VARCHAR(20)) - grams, kilograms, etc.

### **Investment Types Enum**
- [ ] Create `investment_types` enum in database
- [ ] Add validation for type-specific fields
- [ ] Update API to handle type-specific data

### **Page-Based Navigation**
- [x] Create `/investments/create` route
- [x] Create `/investments/:id` route (details page)
- [ ] Create `/investments/:id/edit` route
- [x] Update main navigation to use pages instead of modals

### **Real Estate Investment Type**
- [x] Create `CreateInvestmentPage.vue` component
- [x] Implement real estate specific form fields:
  - [x] Name/Title
  - [x] Delivery Date
  - [x] Construction Status (dropdown)
  - [x] Completion Date
  - [x] Document Links (multiple URL inputs)
  - [x] Developer/Owner
  - [x] Location
  - [x] General Information (textarea)
  - [x] Status (planned, paying, delivered, finished installments, owned)
- [x] Add validation for real estate fields
- [x] Create `InvestmentDetailsPage.vue` for real estate
- [x] Implement status management workflow

### **Precious Metals Investment Type**
- [x] Add precious metals form fields to `CreateInvestmentPage.vue`:
  - [x] Metal Type (dropdown: gold, silver, platinum, etc.)
  - [x] Karat/Purity (dropdown: 21K, 24K, 18K, etc.)
  - [x] Condition (new, used)
  - [x] Form (bars, jewelry, coins)
  - [x] Purpose (investment, personal use for zakat)
  - [x] Amount (number input)
  - [x] Amount Unit (grams, kilograms)
  - [x] Purchase Value
- [x] Add validation for precious metals fields
- [ ] Create visualization components for precious metals:
  - [ ] Grams by karat chart
  - [ ] Purchase value tracking
  - [ ] Current market value display

### **Budget Item Integration**
- [ ] Update `AddBudgetModal.vue` to support investment linking
- [ ] Add "Linked Investment" field to budget item creation
- [ ] Show linked investment info in budget item display
- [x] Create budget items from investment details page
- [x] Display budget items in investment details page

### **Transaction Integration**
- [ ] Update transaction system to link to investments
- [ ] Add investment filter to transaction views
- [ ] Show investment-linked transactions in investment details
- [ ] Update transaction creation to support investment linking

### **Status Management**
- [ ] Implement status update functionality
- [ ] Add status change validation (e.g., can't go back from "owned")
- [ ] Show status history
- [ ] Add status-based filtering

---

## 🚀 **Phase 2: Enhanced Account System**

### **Multi-Currency Accounts**
- [ ] Add currency support to existing accounts
- [ ] Create `currencies` table
- [ ] Add `currency_id` to accounts table
- [ ] Update account creation/editing to support currency selection
- [ ] Implement currency conversion functionality
- [ ] Add exchange rate tracking

### **Currency Management**
- [ ] Create currency management interface
- [ ] Add exchange rate API integration
- [ ] Implement currency balance tracking
- [ ] Add currency conversion in transactions
- [ ] Create currency-specific reports

### **Account-Investment Integration**
- [ ] Link investments to specific accounts
- [ ] Show account balances in different currencies
- [ ] Create currency allocation budget items
- [ ] Track currency investments through accounts

---

## 📊 **Phase 3: Advanced Features**

### **Zakat Calculation Integration**
- [ ] Add zakat calculation logic for precious metals
- [ ] Integrate with current gold/silver prices
- [ ] Calculate zakat amounts based on holdings
- [ ] Create zakat reporting interface
- [ ] Add zakat payment tracking

### **Document Management System**
- [ ] Replace URL-based document links with file upload
- [ ] Implement file storage (Supabase Storage)
- [ ] Add document preview functionality
- [ ] Create document organization system
- [ ] Add document versioning

### **Advanced Visualizations**
- [ ] Create investment portfolio dashboard
- [ ] Add charts for investment performance
- [ ] Implement asset allocation visualization
- [ ] Create investment timeline charts
- [ ] Add comparison charts (real estate vs metals vs currency)

### **Investment Analytics**
- [ ] Calculate ROI for different investment types
- [ ] Track investment performance over time
- [ ] Create investment reports
- [ ] Add investment goal tracking
- [ ] Implement investment alerts/notifications

---

## 🔧 **Phase 4: System Enhancements**

### **Real-Time Updates**
- [ ] Implement real-time investment updates
- [ ] Add live price updates for precious metals
- [ ] Create real-time portfolio value updates
- [ ] Add investment change notifications

### **Advanced Search & Filtering**
- [ ] Add advanced search across all investment types
- [ ] Implement filtering by status, type, date range
- [ ] Add investment tagging system
- [ ] Create saved search functionality

### **Export & Reporting**
- [ ] Create investment portfolio export (PDF, Excel)
- [ ] Add investment performance reports
- [ ] Implement tax reporting features
- [ ] Create investment summary reports

### **Mobile Optimization**
- [ ] Optimize investment pages for mobile
- [ ] Add mobile-specific investment features
- [ ] Implement touch-friendly interfaces
- [ ] Add mobile notifications

---

## 🎨 **Phase 5: User Experience Improvements**

### **Onboarding & Help**
- [ ] Create investment setup wizard
- [ ] Add investment type selection guide
- [ ] Implement contextual help tooltips
- [ ] Create investment best practices guide

### **Personalization**
- [ ] Add user preferences for investment display
- [ ] Implement customizable dashboards
- [ ] Add investment goal setting
- [ ] Create personalized investment recommendations

### **Integration Enhancements**
- [ ] Integrate with external investment platforms
- [ ] Add bank account integration for investment tracking
- [ ] Implement investment news feeds
- [ ] Add market data integration

---

## 📋 **Current Implementation Priority**

### **Week 1: Database & Basic Structure**
- [ ] Update database schema
- [ ] Create page-based navigation
- [ ] Implement basic investment creation

### **Week 2: Real Estate Type**
- [ ] Complete real estate form
- [ ] Create investment details page
- [ ] Implement status management

### **Week 3: Precious Metals Type**
- [ ] Complete precious metals form
- [ ] Add visualization components
- [ ] Implement budget item integration

### **Week 4: Integration & Polish**
- [ ] Complete transaction integration
- [ ] Add validation and error handling
- [ ] Test and refine user experience

---

## 🐛 **Known Issues to Address**

- [ ] Fix investment asset modal not opening
- [ ] Improve form validation
- [ ] Add proper error handling
- [ ] Optimize database queries
- [ ] Add loading states

---

## 📝 **Notes**

- **Focus on user experience**: Page-based approach is better than modals for complex forms
- **Type-specific validation**: Each investment type needs its own validation rules
- **Flexible architecture**: Design for easy addition of new investment types
- **Integration first**: Ensure investments work well with existing budget and transaction systems
- **Mobile-friendly**: Consider mobile usage from the start 