Write-Host "Setting up MERN Stack project (PostgreSQL backend)..."

$rootDir = Join-Path (Get-Location) "exora-mern"
$frontendDir = Join-Path $rootDir "client"
$backendDir = Join-Path $rootDir "server"

# Create project structure
New-Item -ItemType Directory -Force -Path $rootDir
New-Item -ItemType Directory -Force -Path (Join-Path $backendDir "controllers")
New-Item -ItemType Directory -Force -Path (Join-Path $backendDir "models")
New-Item -ItemType Directory -Force -Path (Join-Path $backendDir "routes")
New-Item -ItemType Directory -Force -Path (Join-Path $backendDir "config")
New-Item -ItemType Directory -Force -Path $frontendDir

# Initialize backend
Set-Location $backendDir
npm init -y
npm install express pg dotenv cors
npm install --save-dev nodemon eslint prettier eslint-config-airbnb-base eslint-plugin-prettier

# Create backend starter files using absolute paths (only if missing)
if (-not (Test-Path (Join-Path $backendDir "server.js"))) {
  Set-Content -Path (Join-Path $backendDir "server.js") -Value "// Entry point (Express app)"
}
if (-not (Test-Path (Join-Path $backendDir "config\db.js"))) {
  Set-Content -Path (Join-Path $backendDir "config\db.js") -Value "// PostgreSQL connection logic"
}

# Initialize frontend (using Vite - faster and modern)
Set-Location $rootDir
npm create vite@latest client -- --template react

# Move into frontend and install dependencies
Set-Location $frontendDir
npm install
npm install axios react-router-dom react-toastify

# Configure Prettier and ESLint in both client and server using absolute paths
Set-Content -Path (Join-Path $backendDir ".eslintrc.json") -Value @"
{
  "extends": ["airbnb-base", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "no-console": "off"
  }
}
"@

Set-Content -Path (Join-Path $frontendDir ".eslintrc.json") -Value @"
{
  "extends": ["react-app", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "react/jsx-uses-react": "off"
  }
}
"@

Set-Content -Path (Join-Path $backendDir ".prettierrc") -Value @"
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
"@

Set-Content -Path (Join-Path $frontendDir ".prettierrc") -Value @"
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
"@

# Add server .env.example for PostgreSQL (do not overwrite .env if present)
Set-Content -Path (Join-Path $backendDir "env.example") -Value @"
# Copy to .env and adjust for your local PostgreSQL
PORT=5000
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=exora
# Or use a single URL:
# DATABASE_URL=postgres://postgres:your_password@127.0.0.1:5432/exora
"@
if (-not (Test-Path (Join-Path $backendDir ".env"))) {
  Copy-Item -Path (Join-Path $backendDir "env.example") -Destination (Join-Path $backendDir ".env")
}

# Initialize git repo in rootDir (not inside server anymore)
Set-Location $rootDir
git init

Write-Host "MERN Stack boilerplate created at $rootDir (PostgreSQL backend). Next steps:"
Write-Host "1. Ensure PostgreSQL is running and create database 'exora' (or update PG* vars)"
Write-Host "2. cd $backendDir; review server.js and config/db.js"
Write-Host "3. Update $backendDir/.env with your PostgreSQL credentials"
Write-Host ""
Write-Host "To run backend:   cd server; npx nodemon server.js"
Write-Host "To run frontend:  cd client; npm run dev"
