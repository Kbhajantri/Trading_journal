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

interface TradingJournalWithEmail extends TradingJournal {
  user_email: string;
  user_name: string;
}

interface TradingJournalSectionProps {
  user: User;
  journal: TradingJournalWithEmail;
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
  // const [currentDate, setCurrentDate] = useState(new Date());
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

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

  // Check if a date is editable (temporarily allow all dates for testing)
  const isDateEditable = (dateString: string): boolean => {
    // Temporarily allow editing for all dates to test auto-save functionality
    console.log('Checking if date is editable:', dateString); // Using the parameter to avoid unused warning
    return true;
    // TODO: Change back to: return dateString === today; // Only allow editing for today's date
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
    // Trigger auto-save
    debouncedSave(updatedWeekData);
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
    // Trigger auto-save
    debouncedSave(updatedWeekData);
  };

  // Auto-save functionality with debouncing
  // Debounced save function
  const debouncedSave = (newWeekData: typeof weekData, newStartingCapital?: number) => {
    console.log('⏰ Debounced save triggered', { newWeekData, newStartingCapital });
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      console.log('⏰ Debounced save timeout completed, calling saveToDatabase');
      saveToDatabase(newWeekData, newStartingCapital);
    }, 1000); // Save after 1 second of inactivity

    setSaveTimeout(timeout);
  };

  // Save to database
  const saveToDatabase = async (newWeekData: typeof weekData, newStartingCapital?: number) => {
    console.log('🔄 Starting auto-save...', { newWeekData, newStartingCapital });
    setIsSaving(true);
    try {
      // Validate the data structure
      if (!newWeekData || typeof newWeekData !== 'object') {
        throw new Error('Invalid week data structure');
      }
      
      // Ensure starting capital is a valid number
      const finalStartingCapital = newStartingCapital !== undefined ? newStartingCapital : startingCapital;
      if (isNaN(finalStartingCapital) || !isFinite(finalStartingCapital)) {
        throw new Error('Invalid starting capital value');
      }
      
      const updatedJournal = {
        ...journal,
        week_data: newWeekData,
        starting_capital: finalStartingCapital
      };
      
      console.log('📤 Sending to database:', updatedJournal);
      console.log('📊 Data validation passed');
      
      await onUpdateJournal(updatedJournal);
      console.log('✅ Journal auto-saved successfully');
    } catch (error) {
      console.error('❌ Error auto-saving journal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update journal data with auto-save
  const updateJournal = (newWeekData: typeof weekData) => {
    setWeekData(newWeekData);
    debouncedSave(newWeekData);
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

    Object.values(weekData).forEach((weekDataItem: typeof weekData[string]) => {
      if (!weekDataItem) return;

      weekDataItem.dates.forEach((date: string, dayIndex: number) => {
        let dayTotal = 0;
        const dayCharges = weekDataItem.charges[dayIndex] || 0;
        let dayTrades = 0;

        weekDataItem.trades.forEach((tradeRow: number[]) => {
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
    const start = new Date(journal.start_date);
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBackToDashboard}
              className="glass-light rounded-lg p-2 text-slate-300 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left text-base"></i>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line text-white text-base"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Trading Journal</h1>
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
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-5xl font-bold glow-text">Trading Journal</h1>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-blue-300 bg-blue-900/30 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Auto-saving...
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => {
                console.log('🔄 Manual save triggered');
                saveToDatabase(weekData, startingCapital);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              💾 Save Now
            </button>
            <button
              onClick={async () => {
                console.log('📊 Current week data:', weekData);
                console.log('💰 Starting capital:', startingCapital);
                console.log('📋 Journal ID:', journal.id);
                console.log('👤 User ID:', journal.user_id);
                
                // Test database connection
                try {
                  const testData = {
                    week_data: { 
                      week1: { 
                        trades: [[100]], 
                        charges: [50], 
                        dates: ['2025-01-01'] 
                      } 
                    },
                    starting_capital: 1000
                  };
                  console.log('🧪 Testing database update with:', testData);
                  await onUpdateJournal({ ...journal, ...testData });
                  console.log('✅ Test update successful');
                } catch (error) {
                  console.error('❌ Test update failed:', error);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              🔍 Debug Data
            </button>
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Static Desktop Dashboard - CSS Grid Layout with Dark Background */}
        <div className="mb-8 mx-auto backdrop-blur-xl bg-slate-900/80 rounded-3xl p-8 border border-slate-700/50" style={{ width: '1200px' }}>
          <div className="grid gap-6" style={{
            gridTemplateColumns: '1fr 1fr 1fr',
            columnGap: '24px',
            rowGap: '24px',
            gridTemplateAreas: `
              ".         startCap  ."
              "tcDays    .         ovTrades"
              ".         totalCap  totalEarn"
              "perRev    roi       totalCharges"
            `
          }}>
            
            {/* Area startCap (top center) */}
            <div style={{ gridArea: 'startCap' }} className="card">
              <div className="section-caption">Starting Capital</div>
              <input 
                type="text" 
                value={startingCapital ? `₹${startingCapital.toLocaleString('en-IN')}` : ''}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                  const newValue = numericValue ? parseFloat(numericValue) : 0;
                  setStartingCapital(newValue);
                  // Auto-save starting capital changes
                  debouncedSave(weekData, newValue);
                }}
                onBlur={() => {
                  // Immediate save on blur
                  saveToDatabase(weekData, startingCapital);
                }}
                className="big-amount-input"
                placeholder="Enter Your capital here"
              />
            </div>

            {/* Area tcDays (bottom left) */}
            <div style={{ gridArea: 'tcDays' }} className="flex items-center gap-2">
              <div className="label-chip">Total Completed Days =</div>
              <div className="small-value-pill">{overallTotals.totalDays}</div>
            </div>

            {/* Area ovTrades (bottom right) */}
            <div style={{ gridArea: 'ovTrades' }} className="flex items-center gap-2 justify-end">
              <div className="label-chip">OverAll Trades Taken =</div>
              <div className="small-value-pill">{overallTotals.totalTrades}</div>
            </div>

            {/* Area totalCap (center left) */}
            <div style={{ gridArea: 'totalCap' }} className="flex items-center gap-2">
              <div className="label-chip">Total Capital now =</div>
              <div className={`${overallTotals.totalCapital < 0 ? 'danger-pill' : 'value-pill'}`}>
                ₹{overallTotals.totalCapital.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Area totalEarn (center right) */}
            <div style={{ gridArea: 'totalEarn' }} className="flex items-center gap-2">
              <div className="label-chip">Total Earning =</div>
              <div className="value-pill">₹{(overallTotals.totalEarning - overallTotals.totalCharges).toLocaleString('en-IN')}</div>
            </div>

            {/* Area perRev (bottom left) */}
            <div style={{ gridArea: 'perRev' }} className="flex items-center gap-2">
              <div className="label-chip">Per Day Revenue =</div>
              <div className={`${overallTotals.totalDays > 0 ? 
                ((overallTotals.totalEarning - overallTotals.totalCharges) / overallTotals.totalDays) < 0 ? 'danger-pill' : 'small-value-pill' 
                : 'small-value-pill'}`}>
                {overallTotals.totalDays > 0 ? `₹${((overallTotals.totalEarning - overallTotals.totalCharges) / overallTotals.totalDays).toLocaleString('en-IN')}` : '#DIV/0!'}
              </div>
            </div>

            {/* Area roi (bottom center) */}
            <div style={{ gridArea: 'roi' }} className="flex items-center gap-2">
              <div className="label-chip">ROI =</div>
              <div className={`${overallTotals.roi < 0 ? 'danger-pill' : 'warning-pill'}`}>
                {overallTotals.roi.toFixed(2)}%
              </div>
            </div>

            {/* Area totalCharges (bottom right) */}
            <div style={{ gridArea: 'totalCharges' }} className="flex items-center gap-2">
              <div className="label-chip">Total Charges =</div>
              <div className="warning-pill">₹{overallTotals.totalCharges.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .label-chip {
            background: #475569;
            padding: 12px 14px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            color: #E2E8F0;
          }
          
          .value-pill {
            background: #059669;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 700;
            color: #F0FDF4;
          }
          
          .small-value-pill {
            background: #059669;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
            color: #F0FDF4;
          }
          
          .warning-pill {
            background: #D97706;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
            color: #FFFBEB;
          }
          
          .danger-pill {
            background: #DC2626;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
            color: #FEF2F2;
          }
          
          .card {
            background: #1e293b;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            overflow: hidden;
            border: 1px solid #334155;
          }
          
          .section-caption {
            background: #334155;
            padding: 12px 14px;
            border-radius: 10px 10px 0 0;
            font-size: 16px;
            font-weight: 600;
            color: #E2E8F0;
            text-align: center;
          }
          
          .big-amount-input {
            background: #D97706;
            padding: 16px 14px;
            font-size: 18px;
            font-weight: 700;
            color: #FFFBEB;
            text-align: center;
            min-height: 56px;
            border: none;
            outline: none;
            width: 100%;
            border-radius: 0 0 10px 10px;
            transition: all 0.3s ease;
          }
          
          .big-amount-input:focus {
            outline: none;
            background: #D97706;
            box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.3);
          }
          
          .big-amount-input::placeholder {
            color: #FFFFFF;
            opacity: 0.8;
            transition: all 0.3s ease;
            font-family: Calibri, sans-serif;
            text-align: center;
          }
          
          .big-amount-input:focus::placeholder {
            transform: translateX(20px);
            opacity: 0.4;
            color: #FFFFFF;
            font-family: Calibri, sans-serif;
            text-align: center;
          }
          
          .days-scroll-container::-webkit-scrollbar {
            height: 8px;
          }
          
          .days-scroll-container::-webkit-scrollbar-track {
            background: #1e293b;
            border-radius: 4px;
          }
          
          .days-scroll-container::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 4px;
          }
          
          .days-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        `}</style>

        {/* Week Navigation */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="blue-gradient rounded-xl px-6 py-3">
              <span className="text-lg font-semibold">
                {currentWeek.replace('week', 'WEEK ')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-start">
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

        {/* Daily Trading Sections - Horizontal Layout */}
        {currentWeekData && (
          <div className="mb-8">
            <div className="flex gap-2 overflow-x-auto days-scroll-container" style={{ width: '1200px' }}>
              {currentWeekData.dates.map((date: string, dayIndex: number) => {
                let dayTotal = 0;
                const dayCharges = currentWeekData.charges[dayIndex] || 0;
                
                currentWeekData.trades.forEach((tradeRow: number[]) => {
                  const tradeValue = tradeRow[dayIndex] || 0;
                  dayTotal += tradeValue;
                });
                
                const dayPL = dayTotal - dayCharges;
                const isEditable = isDateEditable(date);
                
                return (
                  <div key={date} className="glass rounded-xl p-4 flex-1 min-h-[400px]">
                    {/* Day Header */}
                    <div className="text-center mb-4">
                      <div className="blue-gradient rounded-lg p-2 mb-2">
                        <div className="font-bold text-base">DAY {dayIndex + 1}</div>
                        <div className="text-sm">{formatDate(date)}</div>
                        {isToday(date) && (
                          <div className="text-xs text-green-300 mt-1">TODAY</div>
                        )}
                      </div>
                    </div>

                    {/* Trade Entries */}
                    <div className="space-y-2 mb-4">
                      {[1, 2, 3, 4, 5].map((tradeNum) => {
                        const tradeValue = currentWeekData.trades[tradeNum - 1]?.[dayIndex] || 0;
                        
                        return (
                          <div key={tradeNum} className="flex items-center gap-2">
                            <div className="glass-light rounded-lg p-2 text-center font-semibold text-sm min-w-[30px]">
                              {tradeNum}
                            </div>
                            <input
                              type="text"
                              value={tradeValue !== 0 ? `₹${tradeValue.toLocaleString('en-IN')}` : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[₹,]/g, '');
                                
                                // Allow empty
                                if (value === '') {
                                  handleTradeChange(tradeNum - 1, dayIndex, '0');
                                  return;
                                }
                                
                                // Allow just minus sign
                                if (value === '-') {
                                  // Set a temporary value to allow minus sign
                                  e.target.value = '-';
                                  return;
                                }
                                
                                // Allow valid numbers (positive and negative)
                                if (/^-?\d*\.?\d*$/.test(value) && value !== '-.' && value !== '.') {
                                  const num = parseFloat(value);
                                  if (!isNaN(num)) {
                                    handleTradeChange(tradeNum - 1, dayIndex, num.toString());
                                  }
                                }
                              }}
                              onFocus={(e) => {
                                // Show raw number without formatting when focused
                                if (tradeValue !== 0) {
                                  e.target.value = tradeValue.toString();
                                } else {
                                  e.target.value = '';
                                }
                              }}
                              onBlur={(e) => {
                                // Reformat when losing focus
                                updateJournal(weekData);
                              }}
                              disabled={!isEditable}
                              className={`input-field rounded-lg p-2 text-center text-sm flex-1 ${
                                isEditable ? '' : 'opacity-50 cursor-not-allowed'
                              } ${
                                isToday(date) ? 'border-green-400' : ''
                              }`}
                              placeholder="₹0"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Charges */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <div className="charges-bg rounded-lg p-2 text-center font-semibold text-amber-100 text-sm min-w-[55px]">
                          Charges
                        </div>
                        <input
                          type="text"
                          value={dayCharges !== 0 ? `₹${dayCharges}` : ''}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^\d]/g, '');
                            const newValue = numericValue ? parseFloat(numericValue) : 0;
                            handleChargeChange(dayIndex, newValue.toString());
                          }}
                          onBlur={() => {
                            updateJournal(weekData);
                          }}
                          disabled={!isEditable}
                          className={`input-field rounded-lg p-2 text-center text-sm flex-1 ${
                            isEditable ? '' : 'opacity-50 cursor-not-allowed'
                          } ${
                            isToday(date) ? 'border-green-400' : ''
                          }`}
                          placeholder="₹0"
                        />
                      </div>
                    </div>

                    {/* Profit/Loss */}
                    <div className="text-center mt-auto">
                      <div className="glass-light rounded-lg p-2">
                        <div className="text-xs text-gray-400 mb-1">Profit/Loss</div>
                        <div className={`font-bold text-base ${
                          dayPL > 0 ? 'text-green-400' : dayPL < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          ₹{dayPL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly Summary */}
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-row items-center gap-6">
            <button className="blue-gradient rounded-xl px-8 py-4 font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
              📊 Report
            </button>
            <div className="flex flex-1 gap-4">
              <div className={`${weekTotals.totalEarning >= 0 ? 'profit-bg' : 'loss-bg'} rounded-xl p-4 text-center flex-1`}>
                <div className={`text-sm mb-1 ${weekTotals.totalEarning >= 0 ? 'text-green-300' : 'text-red-300'}`}>Total Earning</div>
                <div className={`text-xl font-bold ${weekTotals.totalEarning >= 0 ? 'text-green-100' : 'text-red-100'}`}>₹{weekTotals.totalEarning.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="charges-bg rounded-xl p-4 text-center flex-1">
                <div className="text-sm text-amber-300 mb-1">Total Charges</div>
                <div className="text-xl font-bold text-amber-100">₹{weekTotals.totalCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className={`${weekTotals.netProfit >= 0 ? 'profit-bg' : 'loss-bg'} rounded-xl p-4 text-center flex-1`}>
                <div className={`text-sm mb-1 ${weekTotals.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>Net Profit</div>
                <div className={`text-xl font-bold ${weekTotals.netProfit >= 0 ? 'text-green-100' : 'text-red-100'}`}>₹{weekTotals.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
