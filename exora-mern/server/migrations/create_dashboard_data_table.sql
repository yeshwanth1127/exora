-- Create dashboard_data table
CREATE TABLE IF NOT EXISTS dashboard_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_info JSONB DEFAULT '{}',
    workflows JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    is_configured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_data_user_id ON dashboard_data(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_updated_at ON dashboard_data(updated_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dashboard_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboard_data_updated_at
    BEFORE UPDATE ON dashboard_data
    FOR EACH ROW
    EXECUTE FUNCTION update_dashboard_data_updated_at();


