'use client';

import React, { useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
}

interface TradingJournal {
  id: string;
  user_id: string;
  month: number;
  year: number;
  start_date: string; // YYYY-MM-DD format
  starting_capital: number;
  week_data: {
    [key: string]: {
      trades: number[][];
      charges: number[];
      dates: string[];
    };
  };
  created_at: string;
  updated_at: string;
}

interface DashboardSectionProps {
  user: User;
  journals: TradingJournal[];
  onLogout: () => void;
  onCreateJournal: (journal: Omit<TradingJournal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onOpenJournal: (journal: TradingJournal) => void;
  onDeleteJournal: (journalId: string) => void;
}

export default function DashboardSection({
  user,
  journals,
  onLogout,
  onCreateJournal,
  onOpenJournal,
  onDeleteJournal,
}: DashboardSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Generate years from current year - 5 to current year + 5
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      years.push(year);
    }
    setAvailableYears(years);
    
    // Set default start date to today
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
  }, []);

  const handleCreateJournal = () => {
    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    // Parse the start date to get month and year
    const startDateObj = new Date(startDate);
    const month = startDateObj.getMonth() + 1;
    const year = startDateObj.getFullYear();

    // Check if journal already exists for this month/year
    const existingJournal = journals.find(
      j => j.month === month && j.year === year
    );

    if (existingJournal) {
      if (confirm('A journal for this month and year already exists. Do you want to open it?')) {
        onOpenJournal(existingJournal);
      }
      return;
    }

    // Create new journal with proper date structure
    const newJournal = {
      month: month,
      year: year,
      start_date: startDate,
      starting_capital: 0,
      week_data: {}
    };

    onCreateJournal(newJournal);
  };

  const getDaysInMonth = (month: number, year: number): string[] => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: string[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      days.push(date.toISOString().split('T')[0]); // YYYY-MM-DD format
    }
    
    return days;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatStartDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getMonthName = (month: number): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header with Logout */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
              <p className="text-slate-400">Welcome back, {user.name}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="glass-light rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>Logout
          </button>
        </div>

        {/* Create New Journal Section */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Create New Trading Journal</h2>
            <p className="text-slate-400">Start tracking your trades from a specific date (30-day journal)</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <div className="relative">
                <input 
                  type="date"
                  value={startDate}
                  onChange={handleDateChange}
                  className="input-field w-full px-4 py-3 rounded-xl text-white"
                  min={new Date().toISOString().split('T')[0]} // Can't select past dates
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="fas fa-calendar text-slate-400"></i>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select the date you want to start tracking your trades (30 days from this date)
              </p>
            </div>
            
            <button 
              onClick={handleCreateJournal}
              className="btn-primary w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Create 30-Day Journal
            </button>
          </div>
        </div>

        {/* Journal History Section */}
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Journal History</h2>
            <div className="text-sm text-slate-400">
              Total Journals: <span className="text-blue-400 font-semibold">{journals.length}</span>
            </div>
          </div>

          {journals.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="fas fa-book-open text-4xl mb-4 opacity-50"></i>
              <p className="text-lg">No journals created yet</p>
              <p className="text-sm">Create your first trading journal to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journals
                .sort((a, b) => {
                  if (a.year !== b.year) return b.year - a.year;
                  return b.month - a.month;
                })
                .map(journal => {
                  const createdDate = new Date(journal.createdAt).toLocaleDateString();
                  const startDateFormatted = formatStartDate(journal.startDate);
                  const daysInMonth = getDaysInMonth(journal.month, journal.year);
                  const totalDays = daysInMonth.length;
                  
                  return (
                    <div 
                      key={journal.id}
                      className="glass-light rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer" 
                      onClick={() => onOpenJournal(journal)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <i className="fas fa-calendar-alt text-white"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {getMonthName(journal.month)} {journal.year}
                            </h3>
                            <p className="text-sm text-slate-400">
                              Starts {startDateFormatted} • Created {createdDate} • 30-day journal
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-slate-400">Starting Capital</div>
                            <div className="text-lg font-semibold text-green-400">
                               ₹{journal.startingCapital || 0}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenJournal(journal);
                              }}
                              className="glass-light rounded-lg px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <i className="fas fa-eye mr-1"></i>Open
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this journal? This action cannot be undone.')) {
                                  onDeleteJournal(journal.id);
                                }
                              }}
                              className="glass-light rounded-lg px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                              <i className="fas fa-trash mr-1"></i>Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
