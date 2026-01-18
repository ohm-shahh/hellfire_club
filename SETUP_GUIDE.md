# 🌆 Smart City Dashboard - Setup Guide

## 📋 Prerequisites

1. **Python 3.11+**
2. **Node.js 18+** and npm
3. **MySQL 8.0+**
4. **Git**

## 🚀 Quick Start

### 1. Install MySQL (if not installed)

```bash
# Install MySQL using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure MySQL installation (set root password)
mysql_secure_installation
```

### 2. Clone and Setup

```bash
# Navigate to project directory
cd /Users/shahdevkamalkumar/Desktop/INGENIUM_2026/hellfire_club

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

### 3. Configure Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE smartcity CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Or use the SQL script
mysql -u root -p < setup_database.sql
```

### 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your MySQL password
nano .env
```

Update these values in `.env`:
```
DB_PASSWORD=your_mysql_root_password
```

### 5. Start the Application

**Option A: Using the startup script (Recommended)**

```bash
# Make script executable
chmod +x start.sh

# Run the script
./start.sh
```

**Option B: Manual startup**

```bash
# Terminal 1: Start Flask API
source venv/bin/activate
python app.py

# Terminal 2: Start React frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:2800
- **API Health Check**: http://localhost:2800/health

## 📊 System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  React Frontend │  ───>   │   Flask API      │  ───>   │   MySQL     │
│  (Port 5173)    │         │   (Port 2800)    │         │  Database   │
└─────────────────┘         └──────────────────┘         └─────────────┘
```

## 🔧 Troubleshooting

### MySQL Connection Error

```bash
# Error: Can't connect to MySQL server on '127.0.0.1:3306'

# Solution 1: Check if MySQL is running
brew services list | grep mysql
brew services start mysql

# Solution 2: Verify MySQL port
lsof -i :3306

# Solution 3: Check credentials in .env file
cat .env
```

### PyJWT Import Error

```bash
# Error: ModuleNotFoundError: No module named 'jwt'

# Solution:
pip uninstall jwt PyJWT
pip install PyJWT==2.8.0
```

### Frontend Connection Error

```bash
# Error: Failed to load dashboard data

# Check:
1. Flask API is running on port 2800: curl http://localhost:2800/health
2. Database has data: mysql -u root -p smartcity -e "SELECT COUNT(*) FROM events;"
3. Browser console for detailed errors
```

### Port Already in Use

```bash
# Flask port 2800 in use
lsof -ti:2800 | xargs kill -9

# React port 5173 in use
lsof -ti:5173 | xargs kill -9
```

### No Data Showing

```bash
# Wait 10-20 seconds after starting the app
# The background scheduler ingests and processes data every 5-10 seconds

# Check if events are being generated
mysql -u root -p smartcity -e "SELECT COUNT(*) FROM events;"

# Check if metrics are being computed
mysql -u root -p smartcity -e "SELECT COUNT(*) FROM metrics;"

# Manually trigger data generation
curl -X POST http://localhost:2800/api/events
```

## 📁 Project Structure

```
hellfire_club/
├── app.py                 # Flask API server (port 2800)
├── auth.py               # Authentication logic
├── config.py             # Configuration
├── correlation_engine.py # Cross-domain analytics
├── metrics.py            # Metrics computation
├── scenarios.py          # Scenario simulation
├── simulator.py          # Event data generation
├── storage.py            # Database connection pool
├── zones.py              # Zone definitions
├── requirements.txt      # Python dependencies
├── package.json          # Node.js dependencies
├── .env                  # Environment variables (create from .env.example)
├── setup_database.sql    # Database setup script
├── start.sh              # Automated startup script
├── src/
│   ├── App.jsx           # Main React app
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── services/
│   │   └── api.js       # API client (connects to port 2800)
│   └── context/         # React context
└── public/              # Static assets
```

## 🎯 API Endpoints

### Dashboard
- `GET /api/zones` - Get all zones
- `GET /api/kpis/current` - Get current KPIs
- `GET /api/zones/summary` - Get zone summary
- `GET /api/realtime/dashboard` - Real-time dashboard data

### Metrics
- `GET /api/metrics` - Get metrics (with filters)
- `GET /api/metrics/summary` - Latest metrics summary
- `GET /api/metrics/timeseries` - Time series data

### Events
- `GET /api/events` - Get events (with filters)
- `POST /api/events` - Create event

### Scenarios
- `GET /api/scenarios` - Get scenario history
- `POST /api/scenarios/run` - Run scenario simulation

### Correlations
- `GET /api/correlations/matrix` - Correlation matrix
- `GET /api/correlations/insights` - Correlation insights
- `GET /api/correlations/impact` - Domain impact analysis

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user

## 📊 Database Schema

### Tables
1. **events** - Raw event data from sensors
2. **metrics** - Computed metrics per zone
3. **scenarios** - Scenario simulation results
4. **users** - User authentication (if needed)

## 🔄 Data Flow

1. **Simulator** generates events every 5 seconds
2. **Metrics Engine** processes events every 10 seconds
3. **Correlation Engine** analyzes domain interactions
4. **Frontend** fetches data via REST API

## 🎨 Features

- ✅ Real-time dashboard with live metrics
- ✅ Multi-zone city monitoring
- ✅ Traffic, Health, Agriculture domains
- ✅ Scenario simulation
- ✅ Cross-domain correlation analysis
- ✅ Historical data visualization
- ✅ PDF report generation

## 🛠️ Development

```bash
# Backend development
python app.py

# Frontend development with hot reload
npm run dev

# Build for production
npm run build
npm run preview
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | 127.0.0.1 | MySQL host |
| DB_PORT | 3306 | MySQL port |
| DB_USER | root | MySQL username |
| DB_PASSWORD | | MySQL password |
| DB_NAME | smartcity | Database name |
| INGEST_INTERVAL_SECONDS | 5 | Event generation interval |
| PROCESS_INTERVAL_SECONDS | 10 | Metrics computation interval |

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all services are running
3. Check browser console for errors
4. Check Flask logs for API errors
5. Verify database connectivity

## 📄 License

MIT License
