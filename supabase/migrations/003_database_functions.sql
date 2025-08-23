-- Migration: 003_database_functions.sql
-- Create additional database functions for trading journals

-- Function to get trading journals by email
CREATE OR REPLACE FUNCTION get_trading_journals_by_email(input_email TEXT)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    month INTEGER,
    year INTEGER,
    start_date DATE,
    starting_capital DECIMAL(15,2),
    week_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_email TEXT,
    user_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tj.id,
        tj.user_id,
        tj.month,
        tj.year,
        tj.start_date,
        tj.starting_capital,
        tj.week_data,
        tj.created_at,
        tj.updated_at,
        u.email as user_email,
        u.name as user_name
    FROM trading_journals tj
    INNER JOIN users u ON tj.user_id = u.id
    WHERE u.email = input_email
    ORDER BY tj.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all trading journals with email
CREATE OR REPLACE FUNCTION get_all_trading_journals_with_email()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    month INTEGER,
    year INTEGER,
    start_date DATE,
    starting_capital DECIMAL(15,2),
    week_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_email TEXT,
    user_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tj.id,
        tj.user_id,
        tj.month,
        tj.year,
        tj.start_date,
        tj.starting_capital,
        tj.week_data,
        tj.created_at,
        tj.updated_at,
        u.email as user_email,
        u.name as user_name
    FROM trading_journals tj
    INNER JOIN users u ON tj.user_id = u.id
    ORDER BY tj.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely delete a trading journal with validation
CREATE OR REPLACE FUNCTION safe_delete_trading_journal(
    journal_id UUID,
    user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    journal_exists BOOLEAN;
    journal_owner UUID;
BEGIN
    -- Check if journal exists and get owner
    SELECT EXISTS(
        SELECT 1 FROM trading_journals 
        WHERE id = journal_id
    ) INTO journal_exists;
    
    IF NOT journal_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Get the journal owner
    SELECT tj.user_id INTO journal_owner
    FROM trading_journals tj
    WHERE tj.id = journal_id;
    
    -- Check if user owns the journal
    IF journal_owner != user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Delete the journal
    DELETE FROM trading_journals 
    WHERE id = journal_id AND user_id = user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get journal statistics for a user
CREATE OR REPLACE FUNCTION get_user_journal_stats(user_id UUID)
RETURNS TABLE (
    total_journals BIGINT,
    total_starting_capital DECIMAL(15,2),
    average_starting_capital DECIMAL(15,2),
    first_journal_date DATE,
    last_journal_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_journals,
        COALESCE(SUM(starting_capital), 0) as total_starting_capital,
        COALESCE(AVG(starting_capital), 0) as average_starting_capital,
        MIN(start_date) as first_journal_date,
        MAX(start_date) as last_journal_date
    FROM trading_journals
    WHERE user_id = get_user_journal_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_trading_journals_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_trading_journals_with_email() TO authenticated;
GRANT EXECUTE ON FUNCTION safe_delete_trading_journal(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_journal_stats(UUID) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trading_journals_user_id_month_year 
ON trading_journals(user_id, month, year);

CREATE INDEX IF NOT EXISTS idx_trading_journals_start_date 
ON trading_journals(start_date);

-- Add comments for documentation
COMMENT ON FUNCTION get_trading_journals_by_email(TEXT) IS 'Get all trading journals for a specific user email';
COMMENT ON FUNCTION get_all_trading_journals_with_email() IS 'Get all trading journals with user email information';
COMMENT ON FUNCTION safe_delete_trading_journal(UUID, UUID) IS 'Safely delete a trading journal with ownership validation';
COMMENT ON FUNCTION get_user_journal_stats(UUID) IS 'Get statistics for a user''s trading journals';
