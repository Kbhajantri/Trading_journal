'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { databaseService } from '../../../lib/database';
import { TradingJournalWithEmail } from '../../../lib/supabase';
import AllJournalsSection from '../../../components/AllJournalsSection';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function AdminJournalsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [allJournals, setAllJournals] = useState<TradingJournalWithEmail[]>([]);
  const [isLoadingJournals, setIsLoadingJournals] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load all journals when user is authenticated
  useEffect(() => {
    if (user) {
      loadAllJournals();
    }
  }, [user]);

  const loadAllJournals = async () => {
    setIsLoadingJournals(true);
    try {
      const { data, error } = await databaseService.getAllTradingJournalsWithEmail();
      if (error) {
        console.error('Error loading all journals:', error);
      } else {
        setAllJournals(data || []);
      }
    } catch (error) {
      console.error('Error loading all journals:', error);
    } finally {
      setIsLoadingJournals(false);
    }
  };

  const handleOpenJournal = (journal: TradingJournalWithEmail) => {
    router.push(`/journal/${journal.id}`);
  };

  const handleDeleteJournal = async (journalId: string) => {
    try {
      const { error } = await databaseService.deleteTradingJournal(journalId);
      
      if (error) {
        console.error('Error deleting journal:', error);
        return;
      }
      
      // Reload journals after deletion
      await loadAllJournals();
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading || isLoadingJournals) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header with Navigation */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBackToDashboard}
              className="glass-light rounded-lg p-2 text-slate-300 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left text-base"></i>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-users text-white text-base"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin - All Journals</h1>
              <p className="text-slate-400 text-sm">
                View all trading journals organized by user email
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-slate-400">Total Journals</div>
              <div className="text-lg font-bold text-blue-400">{allJournals.length}</div>
            </div>
            <button 
              onClick={signOut}
              className="glass-light rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>Logout
            </button>
          </div>
        </div>
      </div>

      <AllJournalsSection
        journals={allJournals}
        onOpenJournal={handleOpenJournal}
        onDeleteJournal={handleDeleteJournal}
      />
    </div>
  );
}
