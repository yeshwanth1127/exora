# Exora CRM Database Setup

## Overview

The CRM uses a **separate database** (`exora-crm`) in the **same PostgreSQL server** as your main Exora platform (`exora-web`).

## Why Separate Database?

✅ **Clean separation** - CRM data isolated from main platform
✅ **Easy backup** - Backup CRM separately
✅ **Performance** - Independent query optimization
✅ **Security** - Different access controls if needed
✅ **Same server** - No additional infrastructure

## Database Structure

```
PostgreSQL Server (localhost:5432)
├── exora-web         # Your existing Exora database
│   ├── users         # User accounts
│   ├── workflows     # Workflow data
│   └── ...          # Other Exora tables
│
└── exora-crm         # NEW: CRM database
    ├── crm_users     # Links to users in exora-web
    ├── contacts      # CRM contacts
    ├── events        # Appointments
    ├── activities    # Messages, calls
    └── ...          # Other CRM tables
```

## Setup Instructions

### Option 1: Quick Setup (Recommended)

Run this single command:

```bash
# Windows (PowerShell):
cd exora-crm\database
Get-Content 01-create-database.sql | psql -U postgres
Get-Content schema.sql | psql -U postgres -d exora-crm

# Mac/Linux (Bash):
cd exora-crm/database
psql -U postgres -f 01-create-database.sql
psql -U postgres -d exora-crm -f schema.sql
```

### Option 2: Step-by-Step

**Step 1: Create Database**
```bash
psql -U postgres
```

```sql
CREATE DATABASE "exora-crm";
\c exora-crm
CREATE EXTENSION "uuid-ossp";
\q
```

**Step 2: Run Schema**
```bash
psql -U postgres -d exora-crm -f schema.sql
```

**Step 3: Verify**
```bash
psql -U postgres -d exora-crm -c "\dt"
```

You should see:
```
              List of relations
 Schema |        Name         | Type  |  Owner   
--------+---------------------+-------+----------
 public | activities          | table | postgres
 public | automation_history  | table | postgres
 public | contacts            | table | postgres
 public | crm_users           | table | postgres
 public | events              | table | postgres
 public | opportunities       | table | postgres
 public | staff_members       | table | postgres
```

## How CRM Links to Exora Users

The CRM doesn't use foreign keys to exora-web database. Instead:

1. **User activates CRM** from Exora dashboard
2. **JWT token** contains `user.id` from exora-web
3. **CRM backend** extracts `user_id` from JWT
4. **CRM creates record**: `INSERT INTO crm_users (exora_user_id, ...)`
5. **User ID stored** as regular integer (no foreign key)

**This works because:**
- Same JWT_SECRET validates user identity
- CRM trusts Exora's authentication
- No direct DB connection needed between databases

## Connection Strings

### Exora Main Platform
```env
# In exora/exora-mern/server/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/exora-web
# OR individual vars:
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=exora-web
```

### CRM Backend
```env
# In exora-crm/backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/exora-crm
```

### n8n CRM Instance
```env
# In docker-compose or n8n config
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=exora-crm
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=your_password
```

## Migration Script

For easy setup, use this script:

**Windows (setup-crm-db.bat):**
```batch
@echo off
echo Creating exora-crm database...
psql -U postgres -c "CREATE DATABASE \"exora-crm\";"
psql -U postgres -d exora-crm -c "CREATE EXTENSION \"uuid-ossp\";"
echo Running schema...
psql -U postgres -d exora-crm -f schema.sql
echo Done! Verifying tables...
psql -U postgres -d exora-crm -c "\dt"
```

**Mac/Linux (setup-crm-db.sh):**
```bash
#!/bin/bash
echo "Creating exora-crm database..."
psql -U postgres -c "CREATE DATABASE \"exora-crm\";"
psql -U postgres -d exora-crm -c "CREATE EXTENSION \"uuid-ossp\";"
echo "Running schema..."
psql -U postgres -d exora-crm -f schema.sql
echo "Done! Verifying tables..."
psql -U postgres -d exora-crm -c "\dt"
```

## Troubleshooting

### Error: "database exora-crm already exists"
```bash
# Drop and recreate (WARNING: deletes all data)
psql -U postgres -c "DROP DATABASE \"exora-crm\";"
psql -U postgres -c "CREATE DATABASE \"exora-crm\";"
```

### Error: "permission denied"
Make sure you're running as postgres user or a user with CREATEDB permission.

### Error: "peer authentication failed"
Edit PostgreSQL's `pg_hba.conf` to allow password authentication:
```
# Change from:
local   all   postgres   peer

# To:
local   all   postgres   md5
```

Then restart PostgreSQL.

## Backup and Restore

### Backup CRM Database
```bash
pg_dump -U postgres exora-crm > exora-crm-backup.sql
```

### Restore CRM Database
```bash
psql -U postgres exora-crm < exora-crm-backup.sql
```

### Backup Both Databases
```bash
pg_dump -U postgres exora-web > exora-web-backup.sql
pg_dump -U postgres exora-crm > exora-crm-backup.sql
```

## Summary

✅ **Same PostgreSQL server** (localhost:5432)
✅ **Two databases**:
   - `exora-web` (main platform)
   - `exora-crm` (CRM)
✅ **Linked via JWT** (exora_user_id stored from token)
✅ **Clean separation** (easy to manage, backup, scale)

Ready to create the database! Run the migration scripts above.

