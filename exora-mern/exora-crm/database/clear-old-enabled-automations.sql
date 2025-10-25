-- Clear old auto-enabled automations from previous system
-- Run this once to reset all users to clean state
-- Users will manually enable what they need from /automations page

-- Option 1: Delete all enabled automations (users start fresh)
DELETE FROM automation_configs;

-- Option 2: Just disable them (keep config data)
-- UPDATE automation_configs SET enabled = false;

-- After running this, all automation cards will be gray
-- Users can then manually enable what they want



