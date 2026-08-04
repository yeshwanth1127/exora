# Exora CRM Database Setup on VPS

## 📋 Step-by-Step Guide

### Step 1: Upload Database Files to VPS

From your local machine, upload the database folder to your VPS:

```bash
# Option A: Using scp (from your local machine)
scp -r exora/exora-mern/exora-crm/database root@your-vps-ip:/root/exora-crm-db/

# Option B: Using rsync (recommended)
rsync -avz exora/exora-mern/exora-crm/database/ root@your-vps-ip:/root/exora-crm-db/

# Option C: If you already have the full exora folder on VPS
# Just navigate to: cd /path/to/exora/exora-mern/exora-crm/database
```

---

### Step 2: SSH into Your VPS

```bash
ssh root@your-vps-ip
```

---

### Step 3: Navigate to Database Folder

```bash
cd /root/exora-crm-db
# Or wherever you uploaded the files
```

---

### Step 4: Make Setup Script Executable

```bash
chmod +x setup-crm-db.sh
```

---

### Step 5: Run the Setup Script

```bash
./setup-crm-db.sh
```

**OR** run commands manually:

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE \"exora-crm\";"

# 2. Enable UUID extension
psql -U postgres -d exora-crm -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# 3. Run schema
psql -U postgres -d exora-crm -f schema.sql

# 4. Verify tables
psql -U postgres -d exora-crm -c "\dt"
```

---

### Step 6: Verify Setup

Check if all tables were created:

```bash
psql -U postgres -d exora-crm -c "\dt"
```

**Expected output:**
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

Check specific table:

```bash
psql -U postgres -d exora-crm -c "SELECT * FROM crm_users;"
```

---

### Step 7: Test Connection

```bash
psql -U postgres -d exora-crm -c "SELECT current_database();"
```

Should return: `exora-crm`

---

## 🔧 Troubleshooting

### Issue: Permission denied

```bash
# Switch to postgres user
sudo su - postgres
psql -c "CREATE DATABASE \"exora-crm\";"
```

### Issue: Database already exists

```bash
# Drop and recreate (WARNING: This deletes all data!)
psql -U postgres -c "DROP DATABASE IF EXISTS \"exora-crm\";"
psql -U postgres -c "CREATE DATABASE \"exora-crm\";"
```

### Issue: Can't find schema.sql

```bash
# Check current directory
pwd
ls -la

# Make sure you're in the database folder
cd /root/exora-crm-db
# OR
cd /path/to/exora/exora-mern/exora-crm/database
```

---

## 🔐 Update Backend Configuration

After database is created, update your backend .env:

```bash
cd /path/to/exora/exora-mern/exora-crm/backend

# Edit .env file
nano .env
```

Add/Update:

```bash
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/exora-crm

DB_HOST=localhost
DB_PORT=5432
DB_NAME=exora-crm
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

---

## ✅ Verify Everything Works

Test backend connection:

```bash
cd /path/to/exora/exora-mern/exora-crm/backend
node -e "const {testConnection} = require('./config/db'); testConnection();"
```

Should output: `✅ CRM Database connected: exora-crm`

---

## 📊 Database Info

- **Database Name**: `exora-crm`
- **Server**: `localhost:5432` (same as main exora-web)
- **Tables**: 7 (crm_users, contacts, opportunities, events, activities, staff_members, automation_history)
- **Connection**: Separate database on same PostgreSQL instance

---

## 🔄 Next Steps

1. ✅ Database created
2. Configure backend .env
3. Test backend: `node backend/server.js`
4. Build frontend: `npm run build`
5. Deploy with PM2

---

**Setup Date**: __________  
**PostgreSQL Version**: `psql --version`  
**Status**: ⬜ Created | ⬜ Verified | ⬜ Backend Connected

