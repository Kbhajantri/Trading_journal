import { supabase } from './supabase';
import { TradingJournal } from './supabase';

export const databaseService = {
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // Get all trading journals for a user
  async getTradingJournals(userId: string) {
    const { data, error } = await supabase
      .from('trading_journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Get a specific trading journal
  async getTradingJournal(journalId: string) {
    const { data, error } = await supabase
      .from('trading_journals')
      .select('*')
      .eq('id', journalId)
      .single();
    
    return { data, error };
  },

  // Create a new trading journal
  async createTradingJournal(journal: Omit<TradingJournal, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('trading_journals')
      .insert([journal])
      .select()
      .single();
    
    return { data, error };
  },

  // Update a trading journal
  async updateTradingJournal(journalId: string, updates: Partial<TradingJournal>) {
    const { data, error } = await supabase
      .from('trading_journals')
      .update(updates)
      .eq('id', journalId)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete a trading journal
  async deleteTradingJournal(journalId: string) {
    const { error } = await supabase
      .from('trading_journals')
      .delete()
      .eq('id', journalId);
    
    return { error };
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: { name?: string; email?: string }) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  }
};
