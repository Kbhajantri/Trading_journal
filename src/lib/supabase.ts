import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface TradingJournal {
  id: string
  user_id: string
  month: number
  year: number
  start_date: string
  starting_capital: number
  week_data: {
    [key: string]: {
      trades: number[][]
      charges: number[]
      dates: string[]
    }
  }
  created_at: string
  updated_at: string
}

// Extended interface that includes user email
export interface TradingJournalWithEmail extends TradingJournal {
  user_email: string
  user_name: string
}
