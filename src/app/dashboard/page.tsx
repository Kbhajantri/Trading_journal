'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../lib/database';
import { TradingJournal, TradingJournalWithEmail } from '../../lib/supabase';
import DashboardSection from '../../components/DashboardSection';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userJournals, setUserJournals] = useState<TradingJournalWithEmail[]>([]);
  const [isLoadingJournals, setIsLoadingJournals] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load user journals when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserJournals();
    }
  }, [user]);

  const loadUserJournals = async () => {
    if (!user) return;
    
    setIsLoadingJournals(true);
    try {
      const { data, error } = await databaseService.getTradingJournalsWithEmail(user.id);
      if (error) {
        console.error('Error loading journals:', error);
      } else {
        setUserJournals(data || []);
      }
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setIsLoadingJournals(false);
    }
  };

  const handleCreateJournal = async (journal: Omit<TradingJournal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
        // Reload journals to get the new one with email information
        await loadUserJournals();
        router.push(`/journal/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating journal:', error);
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
      
      setUserJournals(prev => prev.filter(j => j.id !== journalId));
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardSection
      user={{ email: user.email!, name: user.user_metadata?.name || user.email!.split('@')[0] }}
      journals={userJournals}
      onLogout={signOut}
      onCreateJournal={handleCreateJournal}
      onOpenJournal={handleOpenJournal}
      onDeleteJournal={handleDeleteJournal}
    />
  );
}