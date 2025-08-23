import { supabase } from './supabase';
import { TradingJournal, TradingJournalWithEmail } from './supabase';

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

  // Get all trading journals for a user with email information
  async getTradingJournalsWithEmail(userId: string) {
    const { data, error } = await supabase
      .from('trading_journals')
      .select(`
        *,
        users!inner(email, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) {
      const journalsWithEmail: TradingJournalWithEmail[] = data.map((journal: TradingJournal & { users: { email: string; name: string } }) => ({
        ...journal,
        user_email: journal.users.email,
        user_name: journal.users.name
      }));
      return { data: journalsWithEmail, error };
    }
    
    return { data, error };
  },

  // Get trading journals by email using the database function
  async getTradingJournalsByEmail(email: string) {
    const { data, error } = await supabase
      .rpc('get_trading_journals_by_email', { user_email: email });
    
    if (data) {
      const journalsWithEmail: TradingJournalWithEmail[] = data.map((journal: TradingJournal & { user_email: string; user_name: string }) => ({
        id: journal.id,
        user_id: journal.user_id,
        month: journal.month,
        year: journal.year,
        start_date: journal.start_date,
        starting_capital: journal.starting_capital,
        week_data: journal.week_data,
        created_at: journal.created_at,
        updated_at: journal.updated_at,
        user_email: journal.user_email,
        user_name: journal.user_name
      }));
      return { data: journalsWithEmail, error };
    }
    
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

  // Get a specific trading journal with email information
  async getTradingJournalWithEmail(journalId: string) {
    const { data, error } = await supabase
      .from('trading_journals')
      .select(`
        *,
        users!inner(email, name)
      `)
      .eq('id', journalId)
      .single();
    
    if (data) {
      const journalWithEmail: TradingJournalWithEmail = {
        ...data,
        user_email: data.users.email,
        user_name: data.users.name
      };
      return { data: journalWithEmail, error };
    }
    
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
    console.log('🔄 Database update attempt:', { journalId, updates });
    
    try {
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Authentication error:', authError);
        return { error: new Error('User not authenticated') };
      }
      
      console.log('✅ User authenticated:', user.id);
      
      // Filter out fields that don't exist in the trading_journals table
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_email, user_name, ...validUpdates } = updates as Record<string, any>;
      
      console.log('🔧 Filtered updates for database:', validUpdates);
      
      const { data, error } = await supabase
        .from('trading_journals')
        .update(validUpdates)
        .eq('id', journalId)
        .eq('user_id', user.id) // Ensure user owns the journal
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase update error:', error);
        return { error };
      }
      
      if (!data) {
        console.error('❌ No data returned from update');
        return { error: new Error('Journal not found or update failed') };
      }
      
      console.log('✅ Database update successful:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Exception in updateTradingJournal:', error);
      return { error: error as Error };
    }
  },

  // Delete a trading journal
  async deleteTradingJournal(journalId: string) {
    try {
      // Use the simple delete function
      const { data, error } = await supabase
        .rpc('simple_delete_journal', {
          journal_id: journalId
        });
      
      if (error) {
        console.error('Database delete error:', error);
        return { error };
      }
      
      // Check if deletion was successful
      if (!data) {
        return { error: new Error('Journal not found or could not be deleted') };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Delete function error:', error);
      return { error: error as Error };
    }
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
  },

  // Get all trading journals with email information using the database function
  async getAllTradingJournalsWithEmail() {
    const { data, error } = await supabase
      .rpc('get_all_trading_journals_with_email');
    
    if (data) {
      const journalsWithEmail: TradingJournalWithEmail[] = data.map((journal: TradingJournal & { user_email: string; user_name: string }) => ({
        id: journal.id,
        user_id: journal.user_id,
        month: journal.month,
        year: journal.year,
        start_date: journal.start_date,
        starting_capital: journal.starting_capital,
        week_data: journal.week_data,
        created_at: journal.created_at,
        updated_at: journal.updated_at,
        user_email: journal.user_email,
        user_name: journal.user_name
      }));
      return { data: journalsWithEmail, error };
    }
    
    return { data, error };
  },

  // Get trading journals by email using the view
  async getTradingJournalsByEmailView(email: string) {
    const { data, error } = await supabase
      .from('trading_journals_with_email')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Get all trading journals using the view
  async getAllTradingJournalsWithEmailView() {
    const { data, error } = await supabase
      .from('trading_journals_with_email')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  }
};
