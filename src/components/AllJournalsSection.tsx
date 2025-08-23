'use client';

import React, { useState, useEffect } from 'react';
import { TradingJournalWithEmail } from '../lib/supabase';

interface AllJournalsSectionProps {
  journals: TradingJournalWithEmail[];
  onOpenJournal: (journal: TradingJournalWithEmail) => void;
  onDeleteJournal: (journalId: string) => void;
}

export default function AllJournalsSection({
  journals,
  onOpenJournal,
  onDeleteJournal,
}: AllJournalsSectionProps) {
  const [groupedJournals, setGroupedJournals] = useState<{ [email: string]: TradingJournalWithEmail[] }>({});
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredJournals, setFilteredJournals] = useState<TradingJournalWithEmail[]>([]);

  useEffect(() => {
    // Group journals by email
    const grouped = journals.reduce((acc, journal) => {
      const email = journal.user_email;
      if (!acc[email]) {
        acc[email] = [];
      }
      acc[email].push(journal);
      return acc;
    }, {} as { [email: string]: TradingJournalWithEmail[] });

    setGroupedJournals(grouped);
  }, [journals]);

  useEffect(() => {
    // Filter journals based on search
    if (searchEmail.trim() === '') {
      setFilteredJournals(journals);
    } else {
      const filtered = journals.filter(journal =>
        journal.user_email.toLowerCase().includes(searchEmail.toLowerCase())
      );
      setFilteredJournals(filtered);
    }
  }, [journals, searchEmail]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthName = (month: number): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  };

  const formatStartDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">All Trading Journals</h1>
          <p className="text-lg text-slate-400">Organized by user email</p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Search Section */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-slate-300 mb-2">Search by Email</label>
            <div className="relative">
              <input 
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter email to search..."
                className="input-field w-full px-4 py-3 rounded-xl text-white text-base"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <i className="fas fa-search text-slate-400 text-base"></i>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Showing {filteredJournals.length} of {journals.length} journals
            </p>
          </div>
        </div>

        {/* Journals by Email */}
        {Object.keys(groupedJournals).length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <i className="fas fa-book-open text-4xl mb-4 opacity-50"></i>
            <p className="text-lg">No journals found</p>
            <p className="text-sm">Create some trading journals to see them here</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedJournals)
              .filter(([email]) => 
                searchEmail.trim() === '' || 
                email.toLowerCase().includes(searchEmail.toLowerCase())
              )
              .map(([email, userJournals]) => (
                <div key={email} className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <i className="fas fa-user text-white text-xl"></i>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{email}</h2>
                        <p className="text-slate-400">
                          {userJournals.length} journal{userJournals.length !== 1 ? 's' : ''} • 
                          User: {userJournals[0]?.user_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Total Journals</div>
                      <div className="text-2xl font-bold text-blue-400">{userJournals.length}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {userJournals
                      .sort((a, b) => {
                        if (a.year !== b.year) return b.year - a.year;
                        return b.month - a.month;
                      })
                      .map(journal => {
                        const createdDate = new Date(journal.created_at).toLocaleDateString();
                        const startDateFormatted = formatStartDate(journal.start_date);
                        
                        return (
                          <div 
                            key={journal.id}
                            className="glass-light rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer" 
                            onClick={() => onOpenJournal(journal)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                  <i className="fas fa-calendar-alt text-white"></i>
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-white">
                                    {getMonthName(journal.month)} {journal.year}
                                  </h3>
                                  <p className="text-sm text-slate-400">
                                    Starts {startDateFormatted} • Created {createdDate} • 30-day journal
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Journal ID: {journal.id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-sm text-slate-400">Starting Capital</div>
                                  <div className="text-lg font-semibold text-green-400">
                                     ₹{journal.starting_capital || 0}
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
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
