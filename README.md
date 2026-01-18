# 🌆 Smart City Data Platform - Complete Integration

**A production-ready, fully integrated smart city platform with Flask backend, React frontend, and cross-domain correlation analysis**

[![Flask](https://img.shields.io/badge/Flask-3.1.2-green)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue)](https://www.python.org/)

---

## 🎯 Project Overview

This is a **complete, production-ready** smart city platform that integrates:

- **Backend**: Flask (Python) with MySQL database
- **Frontend**: React application with real-time updates
- **ML Engine**: Cross-domain correlation analysis (traffic, weather, health, agriculture)
- **Features**: User authentication, correlation visualization, scenario testing, real-time dashboard

---

## ✨ Key Features

### 🔬 **Cross-Domain Correlation Analysis** (CRITICAL FEATURE)
- **ML-powered pattern recognition** between domains (weather → agriculture, traffic → health, etc.)
- **Correlation matrix visualization** showing relationships between all domains
- **Time-lagged analysis** detecting delayed effects (e.g., rain today → crop yield in 2 weeks)
- **Impact quantification** (e.g., "10mm rain = 15% traffic increase")
- **Anomaly detection** when normal correlations break

### 📊 **Real-Time Dashboard**
- Live updates every 10 seconds via polling
- Zone-based metrics and KPIs
- Critical alerts and notifications
- Correlation alerts for unusual patterns

### 🔐 **User Authentication**
- JWT-based authentication system
- User registration and login
- Protected API routes
- Guest access option

### 🎮 **Scenario Testing**
- What-if analysis with cross-domain effects
- Predict impact of policy changes
- Visual comparison (baseline vs. scenario)

### 📈 **Data Visualization**
- Correlation matrix heatmap
- Time-series charts
- Impact analysis graphs
- Anomaly alerts

---

## 🛠️ Tech Stack

### Backend
- **Flask** 3.1.2 - Web framework
- **MySQL** - Database with connection pooling
- **NumPy, Pandas** - Data processing
- **Scikit-learn, SciPy** - ML correlation analysis
- **PyJWT** - Authentication
- **Flask-CORS** - Cross-origin support

### Frontend
- **React** 19.2.0 - UI framework
- **React Router** - Navigation
- **Recharts** - Data visualization
- **TailwindCSS** - Styling
- **Vite** - Build tool

---

## 📋 Prerequisites

- **Python** 3.9+
- **Node.js** 18.0+
- **MySQL** 8.0+ (running on port 3307 by default)
- **Git**

---

## 🚀 Quick Start

### Step 1: Database Setup

```bash
# Connect to MySQL and create database
mysql -u root -p

# In MySQL:
CREATE DATABASE IF NOT EXISTS smartcity
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE smartcity;

# Exit MySQL
exit;
```

### Step 2: Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set environment variables (optional)
export DB_HOST=127.0.0.1
export DB_PORT=3307
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=smartcity

# Run Flask server
python app.py
```

**✅ Backend running at:** `http://localhost:5000`

### Step 3: Load Sample Data

```bash
# In MySQL, load sample data with correlations
mysql -u root -p smartcity < sample_data.sql
```

### Step 4: Frontend Setup

```bash
# Install Node dependencies
npm install

# Start development server
npm run dev
```

**✅ Frontend running at:** `http://localhost:5173`

### Step 5: Access the Application

Open `http://localhost:5173` in your browser.

**Optional**: Register a user at `/login` or continue as guest.

---

## 📁 Project Structure

```
smartcity-platform/
├── app.py                    # Flask main application
├── config.py                 # Configuration
├── storage.py                # Database connection & initialization
├── metrics.py                # Metrics processing
├── scenarios.py              # Scenario execution
├── correlation_engine.py     # ML correlation analysis ⭐
├── auth.py                   # Authentication module
├── simulator.py              # Event generator
├── zones.py                  # Zone definitions
├── requirements.txt          # Python dependencies
├── sample_data.sql           # Sample data with correlations
│
├── src/                      # React frontend
│   ├── pages/
│   │   ├── Overview.jsx
│   │   ├── Correlations.jsx  # Correlation visualization ⭐
│   │   ├── Login.jsx
│   │   └── ...
│   ├── services/
│   │   ├── api.js            # API service layer
│   │   └── correlationService.js  # Correlation APIs ⭐
│   ├── components/
│   └── context/
│       └── CityContext.jsx   # Global state with polling
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user (requires auth)

### Events (Raw Data)
- `GET /api/events?zone_id=&source_type=&start_ts=&end_ts=` - List events
- `POST /api/events` - Create event

### Metrics (Processed Data)
- `GET /api/metrics?zone_id=&metric_name=&start_ts=&end_ts=` - List metrics
- `GET /api/metrics/summary` - Latest metrics summary
- `GET /api/metrics/timeseries?zone_id=&metric=&limit=` - Time series data

### Correlations ⭐ (NEW)
- `GET /api/correlations/matrix?zone_id=` - Correlation matrix
- `GET /api/correlations/insights?zone_id=` - Key insights
- `GET /api/correlations/impact?source_domain=&target_domain=&source_change=` - Impact analysis
- `POST /api/correlations/analyze` - Trigger correlation analysis

### Scenarios
- `POST /api/scenarios/run` - Run scenario with cross-domain effects
- `GET /api/scenarios?scenario_name=&limit=` - List scenarios
- `GET /api/scenarios/:id` - Get scenario by ID

### Real-Time
- `GET /api/realtime/dashboard` - Real-time dashboard data
- `GET /api/kpis/current` - Current KPIs
- `GET /api/zones/summary` - Zone summary

---

## 🔬 Correlation Engine Details

The correlation engine (`correlation_engine.py`) performs:

1. **Correlation Matrix**: Computes Pearson correlations between all domain metrics
2. **Time-Lagged Analysis**: Detects delayed effects (e.g., rain → traffic with 30min lag)
3. **Granger Causality**: Simple causality testing using lag correlations
4. **Anomaly Detection**: Flags when normal correlations break
5. **Impact Quantification**: Estimates how much one factor affects another

### Example Correlations Detected:

- **Rain → Traffic**: Heavy rainfall increases congestion
- **Traffic → Air Quality**: High traffic → pollution → health issues
- **Weather → Agriculture**: Temperature/rainfall → crop yields
- **Agriculture → Health**: Food supply → nutrition → health outcomes
- **Weather → Health**: Heatwaves → heat-related illness

---

## 🗄️ Database Schema

### Tables

**`events`** - Raw sensor data
- `id`, `ts` (timestamp), `zone_id`, `source_type`, `payload_json`

**`metrics`** - Processed KPIs
- `id`, `ts`, `zone_id`, `metric_name`, `value`, `explanation`

**`scenarios`** - What-if analysis results
- `id`, `ts`, `scenario_name`, `params_json`, `result_json`

**`users`** - User authentication
- `id`, `username`, `email`, `password_hash`, `created_at`, `role`

---

## 🧪 Testing with Sample Data

The `sample_data.sql` file includes:

- **Correlated events**: Rain followed by traffic slowdowns
- **Cross-domain patterns**: Traffic → health, weather → agriculture
- **Sample metrics**: Processed KPIs with correlation explanations
- **Scenarios**: Example what-if analyses with cross-domain effects

Load it with:
```bash
mysql -u root -p smartcity < sample_data.sql
```

---

## 🔧 Configuration

### Backend (config.py)

```python
DB_HOST = "127.0.0.1"
DB_PORT = 3307
DB_USER = "root"
DB_PASSWORD = ""  # Set via environment variable
DB_NAME = "smartcity"
```

### Frontend (src/services/api.js)

```javascript
const API_BASE_URL = 'http://localhost:5000';
```

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check MySQL is running
- ✅ Verify database credentials in `config.py`
- ✅ Ensure port 5000 is available

### Frontend can't connect to backend
- ✅ Verify backend is running at `http://localhost:5000`
- ✅ Check CORS is enabled (already configured)
- ✅ Verify API_BASE_URL in `src/services/api.js`

### No correlation data
- ✅ Ensure `sample_data.sql` is loaded
- ✅ Wait a few seconds for scheduler to process events
- ✅ Check `/api/events` returns data

### Authentication issues
- ✅ JWT tokens stored in `localStorage`
- ✅ Token expires after 24 hours
- ✅ Use `/login` page to re-authenticate

---

## 📊 Real-Time Updates

The dashboard polls for updates every **10 seconds**:

- Latest metrics from all zones
- Correlation alerts
- Critical events

To adjust polling interval, edit `src/context/CityContext.jsx`:
```javascript
const POLLING_INTERVAL = 10000; // 10 seconds
```

---

## 🔐 Authentication

### Default Users

Create users via `/api/auth/register` endpoint or `/login` page.

### JWT Tokens

Tokens are stored in `localStorage` and automatically included in API requests.

### Protected Routes

Some routes require authentication (marked with `@require_auth` decorator). Most public endpoints don't require auth.

---

## 📈 Future Enhancements

- [ ] WebSocket support for true real-time updates
- [ ] Advanced ML models (LSTM, Prophet for time series)
- [ ] Interactive map visualization (Leaflet/Mapbox)
- [ ] Export reports as PDF/CSV
- [ ] User roles and permissions
- [ ] Historical trend analysis
- [ ] Predictive alerts based on weather forecasts

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 🙏 Credits

Built with:
- Flask - Web framework
- React - UI library
- MySQL - Database
- Scikit-learn - ML analysis
- Recharts - Visualization

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation
3. Check sample_data.sql for data format examples

---

**⭐ The correlation engine is the core differentiator of this platform - it identifies how different city domains affect each other using ML-powered pattern recognition!**
