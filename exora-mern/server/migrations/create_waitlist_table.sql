-- Create waitlist table for users joining the waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  country_code VARCHAR(10) DEFAULT '+91',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_waitlist_timestamp
BEFORE UPDATE ON waitlist
FOR EACH ROW
EXECUTE FUNCTION update_waitlist_updated_at();

