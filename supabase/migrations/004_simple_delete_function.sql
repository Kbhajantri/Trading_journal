-- Migration: 004_simple_delete_function.sql
-- Create a simple, reliable delete function for trading journals

-- Simple delete function that works with RLS policies
CREATE OR REPLACE FUNCTION simple_delete_journal(journal_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete the journal (RLS policies will handle security)
    DELETE FROM trading_journals 
    WHERE id = journal_id;
    
    -- Get the number of rows deleted
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return true if a row was deleted, false otherwise
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION simple_delete_journal(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION simple_delete_journal(UUID) IS 'Simple function to delete a trading journal with RLS policy enforcement';
