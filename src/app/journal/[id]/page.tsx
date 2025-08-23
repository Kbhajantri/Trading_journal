'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { databaseService } from '../../../lib/database';
import { TradingJournal, TradingJournalWithEmail } from '../../../lib/supabase';
import TradingJournalSection from '../../../components/TradingJournalSection';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function JournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [journal, setJournal] = useState<TradingJournalWithEmail | null>(null);
  const [isLoadingJournal, setIsLoadingJournal] = useState(true);
  const [journalId, setJournalId] = useState<string>('');

  // Get params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setJournalId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load journal data
  useEffect(() => {
    if (user && journalId) {
      loadJournal(journalId);
    }
  }, [user, journalId]);

  const loadJournal = async (journalId: string) => {
    setIsLoadingJournal(true);
    try {
      const { data, error } = await databaseService.getTradingJournalWithEmail(journalId);
      if (error) {
        console.error('Error loading journal:', error);
        router.push('/dashboard');
        return;
      }
      
      if (data) {
        // Verify the journal belongs to the current user
        if (data.user_id !== user?.id) {
          console.error('Unauthorized access to journal');
          router.push('/dashboard');
          return;
        }
        
        setJournal(data);
      } else {
        // Journal not found
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error loading journal:', error);
      router.push('/dashboard');
    } finally {
      setIsLoadingJournal(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleUpdateJournal = async (updatedJournal: TradingJournal) => {
    try {
      console.log('🔄 handleUpdateJournal called with:', updatedJournal);
      const { data, error } = await databaseService.updateTradingJournal(journalId, updatedJournal);
      
      if (error) {
        console.error('❌ Error updating journal:', error);
        console.error('❌ Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        // You could add a toast notification here for user feedback
      } else {
        // Update local state to reflect the changes
        setJournal(prev => prev ? { ...prev, ...updatedJournal } : null);
        console.log('✅ Journal updated successfully');
      }
    } catch (error) {
      console.error('❌ Exception in handleUpdateJournal:', error);
    }
  };

  if (loading || isLoadingJournal) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!journal) {
    return null; // Will redirect in loadJournal
  }

  return (
    <TradingJournalSection
      user={{ email: user.email!, name: user.user_metadata?.name || user.email!.split('@')[0] }}
      journal={journal}
      onLogout={signOut}
      onBackToDashboard={handleBackToDashboard}
      onUpdateJournal={handleUpdateJournal}
    />
  );
}