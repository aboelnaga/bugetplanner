# Budgrt - Personal Budget Management App

A comprehensive Vue.js application for managing personal finances, built specifically for your budget tracking needs with features like Zakat calculation, family budget management, and investment portfolio tracking.

## 🌟 Features

### 📊 Dashboard
- **Monthly Overview**: Current month income, spending, and savings
- **Key Metrics**: Visual cards showing financial KPIs
- **Interactive Charts**: Monthly trends and expense breakdowns
- **5-Year Projections**: Future financial planning visualization

### 💰 Income Management
- **Salary Tracking**: Base salary and bonus management
- **Income Sources**: Multiple income stream tracking
- **Growth Projections**: Salary increase planning

### 💸 Expense Tracking
- **Categorized Expenses**: Organized expense categories
- **Visual Breakdown**: Pie charts and percentage analysis
- **Family Budget Integration**: Connected to family allocations

### 👨‍👩‍👧‍👦 Family Budget
- **Individual Allocations**: Separate budgets for each family member
- **Category Management**: Personal, children, and household expenses
- **Budget Oversight**: Total family expense tracking

### 📈 Investment Portfolio
- **Real Estate Tracking**: Apartment investments and payments
- **Portfolio Overview**: Active investment monitoring
- **Investment Ratios**: Percentage of income invested

### 🕌 Zakat Calculator
- **Islamic Tax Calculation**: Automatic 2.5% calculation
- **Nisab Threshold**: Minimum wealth requirement tracking
- **Payment History**: Track previous Zakat payments
- **Educational Content**: Information about Zakat obligations

## 🛠️ Technology Stack

- **Frontend**: Vue 3 with Composition API
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Pinia for reactive data management
- **Routing**: Vue Router for navigation
- **Charts**: Chart.js with Vue-Chartjs integration
- **Icons**: Lucide Vue for beautiful icons
- **Build Tool**: Vite for fast development

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budgrt-vue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 📱 App Structure

```
src/
├── components/          # Reusable Vue components
│   ├── StatCard.vue          # Metric display cards
│   ├── MonthlyTrendChart.vue # Line chart for trends
│   ├── ExpenseBreakdownChart.vue # Doughnut chart
│   └── ProjectionChart.vue   # Bar chart for projections
├── views/              # Page components
│   ├── Dashboard.vue         # Main overview page
│   ├── Income.vue           # Income management
│   ├── Expenses.vue         # Expense tracking
│   ├── Family.vue           # Family budget management
│   ├── Investments.vue      # Investment portfolio
│   └── Zakat.vue           # Zakat calculator
├── stores/             # Pinia state management
│   └── budget.js           # Main budget data store
├── App.vue             # Root component with navigation
├── main.js             # Application entry point
└── style.css           # Global styles with Tailwind
```

## 📊 Data Features

The app is populated with your actual budget data from your Google Sheets:

- **Current Month**: December 2024 data with actual income and expenses
- **Historical Data**: 12 months of 2024 financial history
- **Future Projections**: 5-year financial forecasts (2025-2029)
- **Family Allocations**: Real family member budget distributions
- **Investment Portfolio**: Your actual real estate investments

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Interactive Navigation**: Sidebar navigation with active states
- **Visual Data**: Charts and graphs for easy data comprehension
- **Color-Coded Metrics**: Green for income, red for expenses, blue for savings

## 🔧 Customization

### Adding New Expense Categories
Modify the `budget.js` store to add new expense tracking:

```javascript
expenses: {
  // Add new category
  newCategory: 0,
  // ... existing categories
}
```

### Updating Chart Colors
Customize chart colors in the chart components:

```javascript
backgroundColor: [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  // Add more colors
]
```

## 📱 Mobile Responsiveness

The app is fully responsive and includes:
- Mobile-friendly navigation
- Responsive grid layouts
- Touch-friendly interactive elements
- Optimized chart sizing for small screens

## 🧮 Calculations

### Zakat Calculation
```javascript
zakatDue = totalSavings * 0.025 // 2.5% of wealth
```

### Savings Rate
```javascript
savingsRate = (monthlySaving / monthlyIncome) * 100
```

### Investment Ratio
```javascript
investmentRatio = (totalInvestments / monthlyIncome) * 100
```

## 🔮 Future Enhancements

Potential features to add:
- **Data Export**: Export reports to PDF/Excel
- **Goal Setting**: Financial goal tracking
- **Notifications**: Payment reminders and alerts
- **Bank Integration**: Connect to bank accounts
- **Currency Support**: Multiple currency options
- **Backup/Sync**: Cloud data synchronization

## 🤝 Contributing

This is a personal budget management tool. If you'd like to suggest improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for personal use. Modify and adapt as needed for your financial management needs.

## 🆘 Support

For questions or issues:
- Check the browser console for any errors
- Ensure all dependencies are properly installed
- Verify Node.js version compatibility

---

**Built with Vue.js for comprehensive personal financial management** 💼📊 

copy from last year with different start date 
copy to current another year with different start date
add copy as a bulck operation

Bulk Operations & Selection
   Row selection with checkboxes
   Bulk edit/delete functionality
   Multi-select indicators and actions
   Selection state management
   Prompt: "Add bulk operations and row selection capabilities to the budget table"

-----
�� Planned Features for Budgrt
1. 🏦 Banking & Account Management
Multiple bank accounts integration
Account balance tracking and synchronization
Transaction categorization and auto-tagging
Bank statement import (CSV, PDF parsing)
Account reconciliation tools
Credit card management and payment tracking

2. 💰 Investment Tracking
Portfolio management with multiple investment types
Stock/ETF tracking with real-time prices
Crypto wallet integration
Real estate investment tracking
Dividend and interest tracking
Investment performance analytics
Asset allocation visualization
Risk assessment tools

3. �� Advanced Analytics & Reporting
Financial health score calculation
Spending pattern analysis with AI insights
Budget vs actual performance reports
Trend analysis and forecasting
Category-wise spending breakdowns
Monthly/quarterly/yearly reports
Export reports (PDF, Excel, CSV)
Custom date range analytics

4. 🔔 Reminders & Notifications
Bill payment reminders with due dates
Budget limit alerts when approaching limits
Investment rebalancing reminders
Savings goal milestone notifications
Subscription renewal alerts
Email and push notifications
Customizable reminder schedules
Snooze and dismiss functionality

5. 🎯 Goal Tracking & Planning
Savings goals (emergency fund, vacation, etc.)
Debt payoff tracking and planning
Retirement planning tools
Financial milestone tracking
Progress visualization with charts
Goal completion celebrations

6. 👨‍👩‍👧‍👦 Family Budget Management
Shared household budgets
Family member accounts and permissions
Allowance tracking for children
Shared expense splitting
Family financial goals
Spending limits per family member

7. 📱 Mobile App Features
Receipt scanning with OCR
Quick expense entry
Offline mode with sync
Biometric authentication
Widget support for quick overview
Voice commands for hands-free entry

8. 🔐 Advanced Security
Two-factor authentication (2FA)
Biometric login support
Data encryption at rest and in transit
Audit logs for all transactions
Privacy controls and data export
GDPR compliance features

9. 🌍 Multi-Currency Support
Multiple currency accounts
Exchange rate tracking
International transaction support
Currency conversion tools
Multi-currency reporting

10. �� AI & Automation
Smart categorization of transactions
Anomaly detection in spending
Predictive analytics for future expenses
Automated budget suggestions
Chatbot support for financial advice
Voice-to-text expense entry

11. 📈 Advanced Charts & Visualizations
Interactive dashboards with drill-down
Heat maps for spending patterns
Sankey diagrams for cash flow
3D charts for portfolio visualization
Real-time data updates
Customizable chart themes

12. �� Integration & Sync
Bank API integration (Plaid, Yodlee)
Credit card synchronization
Investment platform APIs
Accounting software integration
Tax preparation software sync
Third-party app integrations

13. �� Advanced Budgeting
Envelope budgeting system
Zero-based budgeting tools
Rolling budget adjustments
Seasonal budget planning
Variable income handling
Budget templates and sharing

14. �� Personalization
Custom categories and tags
Personalized dashboards
Theme customization (dark/light mode)
Custom alerts and notifications
Personalized insights and tips
Custom report templates

15. 📊 Business Features (if needed)
Business expense tracking
Invoice management
Tax deduction tracking
Business vs personal expense separation
Receipt storage and organization

Phase 2 (Next):
🔄 Reminders & notifications
�� Advanced reporting
�� Goal tracking
�� Enhanced analytics
Phase 3 (Future):
🔄 Banking integration
🔄 Investment tracking
🔄 Family features
🔄 Mobile app