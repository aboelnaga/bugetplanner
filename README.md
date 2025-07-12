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