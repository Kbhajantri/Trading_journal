# Professional Trading Platform

A comprehensive trading journal platform built with Next.js, TypeScript, and Tailwind CSS. Track your trades, analyze performance, and manage multiple trading journals with a beautiful, modern interface.

## Features

### 🔐 Authentication System
- **Login/Signup**: Secure user authentication with email and password
- **Password Strength**: Real-time password strength indicator
- **Forgot Password**: Password reset functionality
- **Social Login**: Google and Facebook integration (UI ready)
- **Form Validation**: Comprehensive client-side validation

### 📊 Dashboard
- **Journal Management**: Create, view, and delete trading journals
- **Month/Year Selection**: Organize journals by specific time periods
- **Journal History**: View all your trading journals with creation dates
- **Quick Actions**: Open or delete journals with one click

### 📈 Trading Journal
- **Week Navigation**: Switch between 5 weeks of trading data
- **Trade Tracking**: Record up to 5 trades per day
- **Charges Management**: Track trading charges and fees
- **Real-time Calculations**: Automatic profit/loss calculations
- **Performance Metrics**: 
  - Total completed days
  - Starting and current capital
  - Per day revenue
  - Total earnings
  - ROI percentage
  - Win/loss days
  - Total charges

### 🎨 Modern UI/UX
- **Glass Morphism**: Beautiful glass effect design
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Professional dark color scheme
- **Smooth Animations**: Fade-in and slide animations
- **Interactive Elements**: Hover effects and transitions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)
- **State Management**: React Hooks
- **Data Persistence**: Local Storage

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gov-schemes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Usage Guide

### 1. Authentication
- **First Time**: Click "Sign up" to create a new account
- **Returning User**: Use your email and password to log in
- **Forgot Password**: Click "Forgot Password?" to reset your password

### 2. Creating a Trading Journal
1. Select the month and year for your journal
2. Click "Create Journal"
3. Set your starting capital
4. Start tracking your trades

### 3. Tracking Trades
1. **Select Week**: Choose which week you want to work with
2. **Enter Trades**: Fill in your trade values for each day
3. **Add Charges**: Record any trading charges or fees
4. **View Results**: See real-time profit/loss calculations

### 4. Analyzing Performance
- **Weekly Summary**: View totals for the current week
- **Global Metrics**: See overall performance across all weeks
- **ROI Calculation**: Track your return on investment
- **Win/Loss Analysis**: Monitor your winning and losing days

## Data Structure

### Trading Journal
```typescript
interface TradingJournal {
  id: number;
  month: number;
  year: number;
  createdAt: Date;
  startingCapital: number;
  weekData: {
    [weekNumber: number]: {
      trades: number[][]; // 5 trades x 5 days
      charges: number[];  // 5 days of charges
    };
  };
}
```

### User Data
```typescript
interface User {
  email: string;
  name: string;
}
```

## Features in Detail

### Authentication Features
- **Email Validation**: Real-time email format validation
- **Password Requirements**: Minimum 8 characters with strength indicator
- **Form Validation**: Comprehensive error handling and user feedback
- **Session Management**: Persistent login state with localStorage

### Trading Features
- **Flexible Trade Entry**: Enter positive (profit) or negative (loss) values
- **Automatic Calculations**: Real-time profit/loss calculations
- **Week Management**: Organize data by weeks for better tracking
- **Performance Metrics**: Comprehensive analytics and reporting

### UI/UX Features
- **Responsive Design**: Optimized for all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@tradingplatform.com or create an issue in the repository.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
