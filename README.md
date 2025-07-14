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

Priority 1: Visual Hierarchy & Readability (Foundation)
Why first: These changes establish the visual foundation that all other improvements will build upon.
1.1 Enhanced Color System & Typography
Better color coding for budget types (income/expense/investment)
Improved typography hierarchy with better font weights and sizes
Enhanced contrast for better readability
Consistent spacing and padding throughout the table

Prompt: "Improve the visual hierarchy of the budget table by enhancing color coding, typography, and spacing for better readability and scanning"

1.2 Current Month & Status Indicators
More prominent current month highlighting
Better visual distinction for scheduled vs actual months
Clearer status indicators for modified amounts
Enhanced hover states for interactive elements
Prompt: "Enhance the current month highlighting and status indicators to make them more prominent and intuitive"

2.1 Budget Item Information Layout
Reorganize the first column to show most important info first
Better spacing between item name, category, and metadata
Improved icons and visual cues for recurrence and scheduling
Cleaner action buttons with better labels and tooltips
Prompt: "Reorganize the budget item information column to improve information hierarchy and readability"

2.2 Summary Rows Enhancement
Better visual separation between regular rows and summary rows
Enhanced styling for totals and subtotals
Clearer categorization of income, expenses, and investments in summaries
Improved contrast to distinguish summary data from regular data
Prompt: "Enhance the summary rows styling and organization to make them more distinct and easier to scan"

Priority 3: Interaction Design & User Experience
Why third: With better visual hierarchy and information architecture, we can improve how users interact with the table.
3.1 Enhanced Action Buttons & Quick Actions
Larger, more accessible action buttons
Better tooltips and hover states
Contextual actions that appear on hover
Improved button grouping and spacing
Prompt: "Improve the action buttons design and interaction patterns for better usability and accessibility"

3.2 Filter Controls Optimization
Cleaner filter layout with better grouping
More intuitive filter labels and descriptions
Active filter indicators that are more prominent
Quick filter presets for common scenarios
Prompt: "Optimize the filter controls layout and interaction patterns for better usability"

3.3 Empty States & Loading States
More engaging empty states with clear call-to-actions
Better loading indicators with skeleton screens
Improved error states with helpful recovery options
Contextual guidance for new users
Prompt: "Enhance empty states, loading states, and error handling for better user experience"

Priority 4: Advanced Interactions
Why fourth: These are nice-to-have features that enhance the experience once the core functionality is solid.
4.1 Keyboard Navigation
Arrow key navigation through table cells
Keyboard shortcuts for common actions
Focus indicators for accessibility
Tab order optimization
Prompt: "Implement keyboard navigation and accessibility improvements for the budget table"

4.2 Bulk Operations & Selection
Row selection with checkboxes
Bulk edit/delete functionality
Multi-select indicators and actions
Selection state management
Prompt: "Add bulk operations and row selection capabilities to the budget table"

Priority 5: Performance & Polish
Why last: These optimizations ensure the table performs well and feels polished.
5.1 Performance Optimizations
Virtual scrolling for large datasets
Optimistic updates for immediate feedback
Debounced search and filtering
Efficient re-rendering strategies
Prompt: "Implement performance optimizations for handling large datasets and smooth interactions"

5.2 Micro-interactions & Polish
Smooth transitions and animations
Hover effects and feedback
Loading states for individual actions
Success/error feedback for user actions
Prompt: "Add micro-interactions and polish to enhance the overall user experience"

Implementation Strategy:
Phase 1 (Foundation): Start with Priority 1 items to establish the visual foundation
Phase 2 (Structure): Move to Priority 2 to improve information organization
Phase 3 (Interaction): Implement Priority 3 improvements for better usability
Phase 4 (Advanced): Add Priority 4 features for power users
Phase 5 (Polish): Finish with Priority 5 optimizations
This order ensures that:
Each improvement builds upon the previous ones
No conflicts between different enhancement areas
The most impactful changes come first
The foundation is solid before adding advanced features