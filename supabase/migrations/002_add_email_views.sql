-- Create a view for trading journals with user email information
CREATE OR REPLACE VIEW trading_journals_with_email AS
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
INNER JOIN users u ON tj.user_id = u.id;

-- Create an index on the email field for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create a function to get trading journals by email
CREATE OR REPLACE FUNCTION get_trading_journals_by_email(user_email TEXT)
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
        u.email,
        u.name
    FROM trading_journals tj
    INNER JOIN users u ON tj.user_id = u.id
    WHERE u.email = user_email
    ORDER BY tj.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all trading journals with email (admin function)
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
        u.email,
        u.name
    FROM trading_journals tj
    INNER JOIN users u ON tj.user_id = u.id
    ORDER BY tj.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on the view and functions
GRANT SELECT ON trading_journals_with_email TO authenticated;
GRANT EXECUTE ON FUNCTION get_trading_journals_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_trading_journals_with_email() TO authenticated;

