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

interface TradingJournalSectionProps {
  user: User;
  journal: TradingJournal;
  onLogout: () => void;
  onBackToDashboard: () => void;
  onUpdateJournal: (journal: TradingJournal) => void;
}

export default function TradingJournalSection({
  user,
  journal,
  onLogout,
  onBackToDashboard,
  onUpdateJournal,
}: TradingJournalSectionProps) {
  const [currentWeek, setCurrentWeek] = useState<string>('week1');
  const [weekData, setWeekData] = useState(journal.week_data || {});
  const [startingCapital, setStartingCapital] = useState(journal.starting_capital || 0);
  const [monthDays, setMonthDays] = useState<{ [key: string]: string[] }>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate 30 days from start date, organized into 6 weeks of 5 days each
  useEffect(() => {
    const days = get30DaysFromStartDate(journal.start_date);
    const weekDays: { [key: string]: string[] } = {};
    
    // Group days into weeks (5 days per week, 6 weeks total)
    for (let week = 1; week <= 6; week++) {
      const weekKey = `week${week}`;
      weekDays[weekKey] = [];
      
      // Add 5 days to each week
      for (let day = 0; day < 5; day++) {
        const dayIndex = (week - 1) * 5 + day;
        if (dayIndex < days.length) {
          weekDays[weekKey].push(days[dayIndex]);
        }
      }
    }
    
    setMonthDays(weekDays);
    
    // Initialize week data if not exists
    const updatedWeekData = { ...weekData };
    Object.keys(weekDays).forEach(weekKey => {
      if (!updatedWeekData[weekKey]) {
        updatedWeekData[weekKey] = {
          trades: Array(5).fill(null).map(() => Array(weekDays[weekKey].length).fill(0)),
          charges: Array(weekDays[weekKey].length).fill(0),
          dates: weekDays[weekKey]
        };
      }
    });
    
    setWeekData(updatedWeekData);
  }, [journal.start_date]);

  // Helper: format a Date to YYYY-MM-DD in local timezone
  const toLocalYMD = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Get 30 days from start date
  const get30DaysFromStartDate = (startDate: string): string[] => {
    const start = new Date(startDate);
    const days: string[] = [];
    
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      days.push(toLocalYMD(currentDate));
    }
    
    return days;
  };

  // Check if a date is today
  const isToday = (dateString: string): boolean => {
    const today = toLocalYMD(new Date());
    return dateString === today;
  };

  // Check if a date is in the past
  const isPastDate = (dateString: string): boolean => {
    const today = toLocalYMD(new Date());
    return dateString < today;
  };

  // Check if a date is editable (today only)
  const isDateEditable = (dateString: string): boolean => {
    return isToday(dateString);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle trade input change
  const handleTradeChange = (tradeIndex: number, dayIndex: number, value: string) => {
    const currentWeekData = weekData[currentWeek];
    if (!currentWeekData) return;

    const updatedTrades = [...currentWeekData.trades];
    updatedTrades[tradeIndex][dayIndex] = parseFloat(value) || 0;

    const updatedWeekData = {
      ...weekData,
      [currentWeek]: {
        ...currentWeekData,
        trades: updatedTrades
      }
    };

    setWeekData(updatedWeekData);
    updateJournal(updatedWeekData);
  };

  // Handle charge input change
  const handleChargeChange = (dayIndex: number, value: string) => {
    const currentWeekData = weekData[currentWeek];
    if (!currentWeekData) return;

    const updatedCharges = [...currentWeekData.charges];
    updatedCharges[dayIndex] = parseFloat(value) || 0;

    const updatedWeekData = {
      ...weekData,
      [currentWeek]: {
        ...currentWeekData,
        charges: updatedCharges
      }
    };

    setWeekData(updatedWeekData);
    updateJournal(updatedWeekData);
  };

  // Update journal data
  const updateJournal = (newWeekData: any) => {
    const updatedJournal = {
      ...journal,
      weekData: newWeekData,
      startingCapital: startingCapital
    };
    onUpdateJournal(updatedJournal);
  };

  // Calculate totals for current week
  const calculateWeekTotals = () => {
    const currentWeekData = weekData[currentWeek];
    if (!currentWeekData) return { totalEarning: 0, totalCharges: 0, netProfit: 0 };

    let totalEarning = 0;
    let totalCharges = 0;

    // Calculate earnings from trades
    currentWeekData.trades.forEach(tradeRow => {
      tradeRow.forEach(tradeValue => {
        totalEarning += tradeValue || 0;
      });
    });

    // Calculate charges
    currentWeekData.charges.forEach(charge => {
      totalCharges += charge || 0;
    });

    return {
      totalEarning,
      totalCharges,
      netProfit: totalEarning - totalCharges
    };
  };

  // Calculate overall totals
  const calculateOverallTotals = () => {
    let totalEarning = 0;
    let totalCharges = 0;
    let completedDays = 0;
    let totalTrades = 0;
    let winDays = 0;
    let lossDays = 0;

    Object.values(weekData).forEach((weekData: any) => {
      if (!weekData) return;

      weekData.dates.forEach((date: string, dayIndex: number) => {
        let dayTotal = 0;
        let dayCharges = weekData.charges[dayIndex] || 0;
        let dayTrades = 0;

        weekData.trades.forEach((tradeRow: number[]) => {
          const tradeValue = tradeRow[dayIndex] || 0;
          if (tradeValue !== 0) {
            dayTotal += tradeValue;
            dayTrades++;
            totalTrades++;
          }
        });

        if (dayTotal !== 0 || dayCharges !== 0) {
          completedDays++;
          const dayPL = dayTotal - dayCharges;
          if (dayPL > 0) winDays++;
          else if (dayPL < 0) lossDays++;
        }

        totalEarning += dayTotal;
        totalCharges += dayCharges;
      });
    });

    const totalCapital = startingCapital + totalEarning - totalCharges;
    const perDayRevenue = completedDays > 0 ? (totalEarning - totalCharges) / completedDays : 0;
    const roi = startingCapital > 0 ? ((totalCapital - startingCapital) / startingCapital * 100) : 0;

    return {
      totalDays: completedDays,
      totalCapital,
      perDayRevenue,
      totalEarning,
      roi,
      totalTrades,
      winDays,
      lossDays,
      totalCharges
    };
  };

  const weekTotals = calculateWeekTotals();
  const overallTotals = calculateOverallTotals();
  const currentWeekData = weekData[currentWeek];

  // Format start date for display
  const formatStartDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate end date (30 days from start)
  const getEndDate = (): string => {
    const start = new Date(journal.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 29); // 30 days total (0-29 = 30 days)
    return end.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="trading-journal min-h-screen">
      {/* Header with Navigation */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBackToDashboard}
              className="glass-light rounded-lg p-2 text-slate-300 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Trading Journal</h1>
              <p className="text-slate-400 text-sm">
                30-Day Journal • {formatStartDate(journal.startDate)} - {getEndDate()}
              </p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="glass-light rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 glow-text">Trading Journal</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Summary Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="profit-bg rounded-xl p-4 text-center">
              <div className="text-sm text-green-300 mb-1">Total Completed Days</div>
              <div className="text-2xl font-bold text-green-100">{overallTotals.totalDays}</div>
            </div>
            <div className="charges-bg rounded-xl p-4">
              <label className="block text-sm text-amber-300 mb-2">Starting Capital</label>
              <input 
                type="number" 
                value={startingCapital}
                onChange={(e) => {
                  setStartingCapital(parseFloat(e.target.value) || 0);
                  updateJournal(weekData);
                }}
                placeholder="10000" 
                className="w-full input-field rounded-lg px-4 py-3 text-white text-lg font-semibold"
              />
            </div>
          </div>

          {/* Middle Column */}
          <div className="glass rounded-2xl p-6 space-y-3">
            <div className="profit-bg rounded-xl p-3 text-center">
              <div className="text-xs text-green-300">Total Capital Now</div>
              <div className="text-lg font-bold text-green-100">₹{overallTotals.totalCapital.toFixed(2)}</div>
            </div>
            <div className="blue-gradient rounded-xl p-3 text-center">
              <div className="text-xs text-blue-100">Per Day Revenue</div>
              <div className="text-lg font-bold">₹{overallTotals.perDayRevenue.toFixed(2)}</div>
            </div>
            <div className="profit-bg rounded-xl p-3 text-center">
              <div className="text-xs text-green-300">Total Earning</div>
              <div className="text-lg font-bold text-green-100">₹{overallTotals.totalEarning.toFixed(2)}</div>
            </div>
            <div className="blue-gradient rounded-xl p-3 text-center">
              <div className="text-xs text-blue-100">ROI</div>
              <div className="text-lg font-bold">{overallTotals.roi.toFixed(2)}%</div>
            </div>
          </div>

          {/* Right Column */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="blue-gradient rounded-xl p-4 text-center">
              <div className="text-sm text-blue-100 mb-1">Overall Trades Taken</div>
              <div className="text-2xl font-bold">{overallTotals.totalTrades}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="profit-bg rounded-xl p-3 text-center">
                <div className="text-xs text-green-300">Win Days</div>
                <div className="text-lg font-bold text-green-100">{overallTotals.winDays}</div>
              </div>
              <div className="loss-bg rounded-xl p-3 text-center">
                <div className="text-xs text-red-300">Loss Days</div>
                <div className="text-lg font-bold text-red-100">{overallTotals.lossDays}</div>
              </div>
            </div>
            <div className="charges-bg rounded-xl p-4 text-center">
              <div className="text-sm text-amber-300 mb-1">Total Charges</div>
              <div className="text-xl font-bold text-amber-100">₹{overallTotals.totalCharges.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="blue-gradient rounded-xl px-6 py-3">
              <span className="text-lg font-semibold">
                {currentWeek.replace('week', 'WEEK ')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(monthDays).map((weekKey) => (
                <button 
                  key={weekKey}
                  className={`week-btn glass-light rounded-lg px-4 py-2 text-sm font-medium ${
                    currentWeek === weekKey ? 'active' : ''
                  }`}
                  onClick={() => setCurrentWeek(weekKey)}
                >
                  {weekKey.replace('week', 'Week ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trading Data Table */}
        {currentWeekData && (
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="w-full">
              {/* Headers */}
              <div className="grid gap-2 mb-4" style={{ 
                gridTemplateColumns: `minmax(120px, 1fr) repeat(${currentWeekData.dates.length}, minmax(100px, 1fr))` 
              }}>
                <div className="blue-gradient rounded-lg p-3 text-center font-semibold text-base">Day</div>
                {currentWeekData.dates.map((date: string, index: number) => (
                  <div key={date} className="blue-gradient rounded-lg p-3 text-center font-semibold text-sm">
                    <div>{formatDate(date)}</div>
                    {isToday(date) && (
                      <div className="text-xs text-green-300 mt-1">TODAY</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Trade Rows */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((tradeNum) => (
                  <div key={tradeNum} className="grid gap-2" style={{ 
                    gridTemplateColumns: `minmax(120px, 1fr) repeat(${currentWeekData.dates.length}, minmax(100px, 1fr))` 
                  }}>
                    <div className="glass-light rounded-lg p-3 text-center font-semibold text-base">Trade {tradeNum}</div>
                    {currentWeekData.dates.map((date: string, dayIndex: number) => {
                      const isEditable = isDateEditable(date);
                      const tradeValue = currentWeekData.trades[tradeNum - 1]?.[dayIndex] || 0;
                      
                      return (
                        <input
                          key={`${tradeNum}-${date}`}
                          type="number"
                          value={tradeValue || ''}
                          onChange={(e) => handleTradeChange(tradeNum - 1, dayIndex, e.target.value)}
                          disabled={!isEditable}
                          className={`input-field rounded-lg p-3 text-center text-base ${
                            isEditable ? '' : 'opacity-50 cursor-not-allowed'
                          } ${
                            isToday(date) ? 'border-green-400' : ''
                          }`}
                          placeholder="0"
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Charges Row */}
              <div className="grid gap-2 mb-2" style={{ 
                gridTemplateColumns: `minmax(120px, 1fr) repeat(${currentWeekData.dates.length}, minmax(100px, 1fr))` 
              }}>
                <div className="charges-bg rounded-lg p-3 text-center font-semibold text-amber-100 text-base">Charges</div>
                {currentWeekData.dates.map((date: string, dayIndex: number) => {
                  const isEditable = isDateEditable(date);
                  const chargeValue = currentWeekData.charges[dayIndex] || 0;
                  
                  return (
                    <input
                      key={`charges-${date}`}
                      type="number"
                      value={chargeValue || ''}
                      onChange={(e) => handleChargeChange(dayIndex, e.target.value)}
                      disabled={!isEditable}
                      className={`input-field rounded-lg p-3 text-center text-base ${
                        isEditable ? '' : 'opacity-50 cursor-not-allowed'
                      } ${
                        isToday(date) ? 'border-green-400' : ''
                      }`}
                      placeholder="0"
                    />
                  );
                })}
              </div>

              {/* Profit/Loss Row */}
              <div className="grid gap-2" style={{ 
                gridTemplateColumns: `minmax(120px, 1fr) repeat(${currentWeekData.dates.length}, minmax(100px, 1fr))` 
              }}>
                <div className="glass-light rounded-lg p-3 text-center font-semibold text-base">Profit/Loss</div>
                {currentWeekData.dates.map((date: string, dayIndex: number) => {
                  let dayTotal = 0;
                  let dayCharges = currentWeekData.charges[dayIndex] || 0;
                  
                  currentWeekData.trades.forEach((tradeRow: number[]) => {
                    dayTotal += tradeRow[dayIndex] || 0;
                  });
                  
                  const dayPL = dayTotal - dayCharges;
                  
                  return (
                    <div 
                      key={`pl-${date}`}
                      className={`glass-light rounded-lg p-3 text-center font-bold text-base ${
                        dayPL > 0 ? 'text-green-400' : dayPL < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}
                    >
                      ₹{dayPL.toFixed(2)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Summary */}
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <button className="blue-gradient rounded-xl px-8 py-4 font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
              📊 Report
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-2xl">
              <div className="profit-bg rounded-xl p-4 text-center">
                <div className="text-sm text-green-300 mb-1">Total Earning</div>
                <div className="text-xl font-bold text-green-100">₹{weekTotals.totalEarning.toFixed(2)}</div>
              </div>
              <div className="charges-bg rounded-xl p-4 text-center">
                <div className="text-sm text-amber-300 mb-1">Total Charges</div>
                <div className="text-xl font-bold text-amber-100">₹{weekTotals.totalCharges.toFixed(2)}</div>
              </div>
              <div className="blue-gradient rounded-xl p-4 text-center">
                <div className="text-sm text-blue-100 mb-1">Net Profit</div>
                <div className="text-xl font-bold">₹{weekTotals.netProfit.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
