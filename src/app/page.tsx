'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { databaseService } from '../lib/database';
import AuthSection from '../components/AuthSection';
import DashboardSection from '../components/DashboardSection';
import TradingJournalSection from '../components/TradingJournalSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { TradingJournal } from '../lib/supabase';

export default function TradingPlatform() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'trading'>('auth');
  const [userJournals, setUserJournals] = useState<TradingJournal[]>([]);
  const [currentJournal, setCurrentJournal] = useState<TradingJournal | null>(null);

  // Load user journals when user is authenticated
  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
      loadUserJournals();
    } else {
      setCurrentView('auth');
      setUserJournals([]);
      setCurrentJournal(null);
    }
  }, [user]);

  const loadUserJournals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await databaseService.getTradingJournals(user.id);
      if (error) {
        console.error('Error loading journals:', error);
      } else {
        setUserJournals(data || []);
      }
    } catch (error) {
      console.error('Error loading journals:', error);
    }
  };

  const handleLogin = () => {
    // This will be handled by the AuthContext
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleCreateJournal = async (journal: Omit<TradingJournal, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await databaseService.createTradingJournal({
        ...journal,
        user_id: user.id,
        starting_capital: 0,
        week_data: {}
      });
      
      if (error) {
        console.error('Error creating journal:', error);
        return;
      }
      
      if (data) {
        setUserJournals(prev => [data, ...prev]);
        setCurrentJournal(data);
        setCurrentView('trading');
      }
    } catch (error) {
      console.error('Error creating journal:', error);
    }
  };

  const handleOpenJournal = (journal: TradingJournal) => {
    setCurrentJournal(journal);
    setCurrentView('trading');
  };

  const handleDeleteJournal = async (journalId: string) => {
    try {
      const { error } = await databaseService.deleteTradingJournal(journalId);
      
      if (error) {
        console.error('Error deleting journal:', error);
        return;
      }
      
      setUserJournals(prev => prev.filter(j => j.id !== journalId));
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentJournal(null);
  };

  const handleUpdateJournal = async (updatedJournal: TradingJournal) => {
    try {
      const { data, error } = await databaseService.updateTradingJournal(updatedJournal.id, {
        starting_capital: updatedJournal.starting_capital,
        week_data: updatedJournal.week_data
      });
      
      if (error) {
        console.error('Error updating journal:', error);
        return;
      }
      
      if (data) {
        setUserJournals(prev => prev.map(j => j.id === data.id ? data : j));
        setCurrentJournal(data);
      }
    } catch (error) {
      console.error('Error updating journal:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthSection onLogin={handleLogin} />;
  }

  if (currentView === 'dashboard') {
    return (
      <DashboardSection
        user={{ email: user.email!, name: user.user_metadata?.name || user.email!.split('@')[0] }}
        journals={userJournals}
        onLogout={handleLogout}
        onCreateJournal={handleCreateJournal}
        onOpenJournal={handleOpenJournal}
        onDeleteJournal={handleDeleteJournal}
      />
    );
  }

  if (currentView === 'trading' && currentJournal) {
    return (
      <TradingJournalSection
        user={{ email: user.email!, name: user.user_metadata?.name || user.email!.split('@')[0] }}
        journal={currentJournal}
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onUpdateJournal={handleUpdateJournal}
      />
    );
  }

  return <AuthSection onLogin={handleLogin} />;
}
