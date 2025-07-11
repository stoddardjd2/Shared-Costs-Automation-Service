# Shared Costs App

A comprehensive React application for tracking and splitting shared expenses with automatic bank transaction detection via Plaid integration.

## 🚀 Features

- 🏦 **Bank Integration**: Connect bank accounts via Plaid API for automatic expense detection
- 💰 **Expense Tracking**: Track both one-time and recurring shared costs
- 👥 **Advanced Participant Management**: Search, filter, and add participants on-the-fly
- 🔄 **Recurring Costs**: Set up and track subscriptions with frequency scheduling
- 📊 **Overcharge Detection**: Automatically detect unusual charges on recurring expenses
- 💳 **Payment Requests**: Send customized payment requests with due dates and messages
- 🔍 **Smart Search**: Real-time participant search and filtering
- ➗ **Flexible Splits**: Support for both equal and custom amount splits with validation
- 📱 **Responsive Design**: Optimized for desktop and mobile devices
- 🧭 **React Router**: Full navigation with URL-based routing and browser history

## 📁 File Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.js                    # User authentication
│   │   └── ProtectedRoute.js           # Route protection
│   ├── dashboard/
│   │   ├── Dashboard.js                # Main dashboard overview
│   │   ├── BankConnectionPrompt.js     # Plaid integration prompt
│   │   ├── OverchargeAlerts.js         # Overcharge detection alerts
│   │   ├── RecurringCostsSection.js    # Recurring subscription management
│   │   ├── RecurringCostsFromBank.js   # Bank-detected transactions
│   │   └── OneTimeCosts.js             # One-time expense tracking
│   ├── costs/
│   │   └── NewCost.js                  # Complete cost creation/editing
│   ├── payments/
│   │   └── PaymentRequests.js          # Payment request management
│   └── layout/
│       └── Navigation.js               # App navigation header
├── contexts/
│   ├── AuthContext.js                  # Authentication state management
│   └── DataContext.js                  # Application data management
├── services/
│   └── plaidService.js                 # Plaid API integration
├── utils/
│   └── helpers.js                      # Utility functions
├── App.js                              # Main app with routing
├── index.js                            # App entry point
└── index.css                           # Global styles
```

## 🎯 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Run the setup scripts** in order:
   ```bash
   chmod +x part1-setup.sh part2-contexts.sh part3-auth.sh part4-dashboard.sh part4b-dashboard-sections.sh part5-newcost.sh part6-payments.sh part7-final.sh
   
   ./part1-setup.sh
   ./part2-contexts.sh
   ./part3-auth.sh
   ./part4-dashboard.sh
   ./part4b-dashboard-sections.sh
   ./part5-newcost.sh
   ./part6-payments.sh
   ./part7-final.sh
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage Guide

### Demo Mode
- Use any email/password combination to log in
- Sample data is pre-loaded for demonstration
- Bank integration uses mock data when Plaid connection fails

### Adding Costs
1. Click "Add Cost" from the dashboard
2. Fill in cost details (name, amount, participants)
3. Set as recurring for subscriptions or regular bills
4. Add Plaid match pattern for automatic bank detection
5. Choose between equal or custom split amounts
6. Search and select participants easily
7. Real-time validation ensures accuracy

### Advanced Participant Management
- **Search**: Real-time filtering by name or email
- **Add New**: Create participants directly from search
- **Visual Selection**: Avatar-based selection with easy removal
- **Bulk Operations**: Select multiple participants efficiently

### Payment Requests
1. Navigate to payment requests from any cost
2. Select recipients using visual participant picker
3. Set amount per person and optional due date
4. Add custom message for context
5. Send reminders and track payment status
6. Mark payments as completed when received

### Custom Split Calculations
- **Equal Split**: Automatic per-person calculation
- **Custom Amounts**: Manual amount entry with validation
- **Real-time Totals**: Live calculation and error checking
- **Flexible Switching**: Change split types anytime

## 🛠 Technologies Used

- **React 18**: Modern frontend framework with hooks
- **React Router DOM**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Beautiful icon library
- **Plaid API**: Secure bank account integration
- **Context API**: Centralized state management

## 🌐 Routes

- `/` - Redirects to dashboard
- `/login` - User authentication page
- `/dashboard` - Main overview and cost management
- `/costs/new` - Add new shared cost
- `/costs/edit/:id` - Edit existing cost
- `/costs/requests/:id?` - Payment requests (with optional cost context)

## 🧩 Component Overview

### Authentication Layer
- **Login**: Secure user authentication with demo mode
- **ProtectedRoute**: Route protection for authenticated users only

### Dashboard Components
- **Dashboard**: Main hub with statistics and cost overviews
- **BankConnectionPrompt**: Seamless Plaid integration setup
- **OverchargeAlerts**: Smart alerts for unusual charges
- **RecurringCostsSection**: Comprehensive subscription management
- **RecurringCostsFromBank**: Bank-detected recurring transactions
- **OneTimeCosts**: One-time expense tracking and management

### Cost Management
- **NewCost**: Feature-rich cost creation and editing with:
  - Advanced participant search and selection
  - Custom vs equal split options with validation
  - Recurring cost settings and scheduling
  - Plaid matching patterns for auto-detection
  - Real-time form validation and error handling

### Payment Management
- **PaymentRequests**: Complete payment request system with:
  - Bulk recipient selection with visual interface
  - Custom messages and due date setting
  - Payment status tracking and updates
  - Reminder functionality for pending payments
  - Integration with cost context

## ⚡ Advanced Features

### Smart Participant Management
- **Real-time Search**: Instant filtering as you type
- **Dynamic Addition**: Add participants directly from search results
- **Visual Interface**: Avatar-based selection for better UX
- **Bulk Selection**: Efficient multi-participant operations

### Intelligent Split Calculations
- **Equal Distribution**: Automatic per-person calculations
- **Custom Amounts**: Manual entry with real-time validation
- **Live Totals**: Instant feedback on split accuracy
- **Error Prevention**: Built-in validation prevents mistakes

### Recurring Cost Intelligence
- **Flexible Scheduling**: Weekly, monthly, quarterly, yearly options
- **Next Due Calculation**: Automatic due date management
- **Payment Tracking**: Per-participant status monitoring
- **Renewal System**: Easy period-to-period transitions

### Bank Integration Features
- **Automatic Detection**: Smart recurring transaction recognition
- **Pattern Matching**: Customizable transaction matching
- **Overcharge Alerts**: Statistical analysis for unusual charges
- **Demo Fallback**: Graceful fallback to sample data

## 🔧 Development Guide

### Adding New Features
1. Create components in appropriate directory structure
2. Add routes in `App.js` if navigation is needed
3. Update context providers for state management
4. Add utility functions in `utils/helpers.js`
5. Follow existing patterns for consistency

### State Management Architecture
- **AuthContext**: Handles user authentication and session state
- **DataContext**: Manages all application data (participants, costs, transactions)
- **Component State**: Local state for forms and UI interactions
- **URL State**: Route parameters for navigation context

### Styling Guidelines
- **Tailwind Classes**: Use utility-first approach
- **Responsive Design**: Mobile-first responsive patterns
- **Consistent Colors**: Follow established color scheme
- **Interactive States**: Hover, focus, and disabled states
- **Accessibility**: Proper contrast and semantic markup

### Best Practices
- **Component Separation**: Single responsibility principle
- **Hook Usage**: Custom hooks for reusable logic
- **Error Handling**: Graceful error states and fallbacks
- **Performance**: Efficient re-renders and state updates
- **Type Safety**: Consistent prop validation

## 🌟 Key Innovations

### Real-time Validation System
The app features a sophisticated validation system that provides instant feedback:
- Form field validation with visual indicators
- Split calculation verification with error messages
- Participant selection validation
- Custom split total matching

### Intelligent Search and Filtering
Advanced search capabilities throughout the application:
- Real-time participant filtering
- Smart search suggestions
- Add-on-the-fly functionality
- Historical search patterns

### Dynamic Cost Management
Flexible cost handling with multiple modes:
- Create new costs from scratch
- Edit existing costs with pre-populated data
- Clone costs for similar expenses
- Convert between one-time and recurring

### Contextual Payment Requests
Smart payment request system with context awareness:
- Cost-specific request generation
- Bulk recipient management
- Custom messaging per request
- Due date and reminder management

## 📈 Future Enhancements

- Integration with additional payment processors
- Receipt photo upload and OCR processing
- Advanced reporting and analytics
- Multi-currency support
- Team/group management features
- Mobile app development
- API for third-party integrations

## 🔐 Security Considerations

- Client-side demo mode for development
- Secure Plaid integration patterns
- Protected route implementation
- Input validation and sanitization
- Error handling without data exposure

## 📝 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper testing
4. Submit a pull request with detailed description

## 📞 Support

For questions, issues, or feature requests:
- Open a GitHub issue with detailed description
- Include steps to reproduce for bugs
- Provide screenshots for UI-related issues

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies.**
