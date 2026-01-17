# 🌆 Hellfire Club - Smart City Intelligence Platform

<div align="center">

![Smart City Dashboard](https://img.shields.io/badge/Smart_City-Dashboard-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**An AI-powered urban intelligence platform for real-time city monitoring, predictive analytics, and smart decision-making**

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [📸 Screenshots](#-screenshots) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Error Handling](#️-error-handling)
- [Keyboard Shortcuts](#️-keyboard-shortcuts)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

**Hellfire Club** is a comprehensive smart city dashboard that leverages real-time data analytics, machine learning predictions, and interactive visualizations to help city administrators make informed decisions across multiple urban domains.

### 🌟 Why Hellfire Club?

- 📊 **Real-time Monitoring**: Live data from traffic, health, weather, and agriculture sensors
- 🤖 **AI-Powered Insights**: Machine learning models for disease outbreak prediction and traffic forecasting
- 🎮 **Interactive Simulations**: What-if scenario modeling for policy decisions
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔒 **Secure & Scalable**: Built with modern security practices and scalable architecture

---

## ✨ Features

### 📊 Command Center (Overview)
<details>
<summary>Click to expand</summary>

- **Real-time City Statistics**: Live metrics across traffic, health, food prices, and weather
- **Critical Alerts System**: Priority-based notifications for urgent city events
- **Composite Risk Map**: Visual heatmap combining multiple risk factors
- **Multi-City Support**: Switch between Ahmedabad, Bangalore, Mumbai, and Delhi
- **System Health Monitoring**: Backend pipeline status and data freshness indicators

</details>

### 🏥 Public Health Intelligence
<details>
<summary>Click to expand</summary>

- **Disease Outbreak Prediction**: Correlation analysis between weather and disease cases
- **Environmental Risk Tracking**: Real-time monitoring of humidity, temperature, and standing water
- **Hospital Capacity Planning**: Predicted surge forecasting with 4-day lookahead
- **Interactive Visualizations**: Dual-axis charts showing rainfall vs disease correlation
- **Risk Level Classification**: Automatic categorization of health threats

</details>

### 🚗 Traffic & Urban Mobility
<details>
<summary>Click to expand</summary>

- **24-Hour Congestion Timeline**: Hourly traffic patterns with peak hour identification
- **Live Route Status**: Color-coded severity indicators (Red/Yellow/Green)
- **AI Anomaly Detection**: Automatic identification of unusual traffic patterns
- **Public Transport Integration**: Real-time metro and bus network status
- **Average Speed Monitoring**: Per-route speed tracking with historical comparisons

</details>

### 🔬 Simulation Laboratory
<details>
<summary>Click to expand</summary>

- **Interactive Scenario Modeling**: Adjust multiple parameters simultaneously
- **Parameter Controls**:
  - 🌧️ Rainfall Increase: 0-20% slider
  - 🦟 Mosquito Control Budget: -10% to +100% adjustment
  - 🛣️ Highway Closure: Toggle impact
- **Predictive Charts**: Side-by-side baseline vs scenario comparison
- **Impact Metrics**: Quantified effects on food prices, hospital load, and disease cases
- **What-If Analysis**: Test policy decisions before implementation

</details>

### 🌾 Agriculture & Supply Chain
<details>
<summary>Click to expand</summary>

- **Visual Supply Chain Flow**: Farm → Transport → Warehouse → Consumer tracking
- **Price Volatility Analysis**: 30-day price charts with spike detection
- **Spoilage Risk Alerts**: Temperature and delay-based risk assessment
- **Market Inventory Dashboard**: Real-time stock levels for wheat, vegetables, and fruits
- **Price Spike Reasoning**: AI-generated explanations for market anomalies

</details>

### 🤖 AI Assistant
<details>
<summary>Click to expand</summary>

- **Floating Chat Interface**: Always accessible from any page
- **Context-Aware Responses**: Understands current page and city context
- **Natural Language Queries**: Ask questions in plain English
- **Quick Navigation**: Suggested routes to relevant dashboards
- **Data Analysis**: On-demand insights from city data

</details>

---

## 🛠️ Tech Stack

### **Frontend** (hellfire_club/)

<table>
<tr>
<th>Technology</th>
<th>Version</th>
<th>Purpose</th>
</tr>
<tr>
<td>⚛️ <strong>React</strong></td>
<td>19.2.0</td>
<td>UI Framework with hooks and context</td>
</tr>
<tr>
<td>⚡ <strong>Vite</strong></td>
<td>7.2.4</td>
<td>Lightning-fast build tool with HMR</td>
</tr>
<tr>
<td>🎨 <strong>TailwindCSS</strong></td>
<td>3.4.1</td>
<td>Utility-first CSS framework</td>
</tr>
<tr>
<td>🧭 <strong>React Router</strong></td>
<td>7.12.0</td>
<td>Client-side routing</td>
</tr>
<tr>
<td>📊 <strong>Recharts</strong></td>
<td>3.6.0</td>
<td>Composable charting library</td>
</tr>
<tr>
<td>🎯 <strong>Lucide React</strong></td>
<td>0.562.0</td>
<td>Beautiful icon library</td>
</tr>
</table>

### **Backend** (backend/)

<table>
<tr>
<th>Technology</th>
<th>Purpose</th>
</tr>
<tr>
<td>🐍 <strong>Python 3.9+</strong></td>
<td>Backend runtime</td>
</tr>
<tr>
<td>🚀 <strong>FastAPI</strong></td>
<td>High-performance async API framework</td>
</tr>
<tr>
<td>📊 <strong>Pandas</strong></td>
<td>Data manipulation and analysis</td>
</tr>
<tr>
<td>🤖 <strong>Scikit-learn</strong></td>
<td>Machine learning models</td>
</tr>
<tr>
<td>📈 <strong>NumPy</strong></td>
<td>Numerical computing</td>
</tr>
</table>

### **Data Sources** (data/)

- 🌦️ `data/weather_data.csv` - Temperature, humidity, rainfall, wind speed
- 🏥 `data/health_data.csv` - Disease cases, hospital visits, pollution levels
- 🚗 `data/traffice_data.csv` - Vehicle counts, congestion, incidents
- 🌾 `data/agriculture_data.csv` - Soil moisture, crop stages, pest risk

### **Development Tools**

- ✅ **ESLint** - Code quality and consistency
- 🎨 **PostCSS** - CSS processing with Autoprefixer
- 📝 **Jupyter Notebooks** - Data analysis and model training

---

## 📁 Project Structure

```
hellfire_club/
├── 📄 README.md                    # This file
├── 📂 backend/                     # Python FastAPI server
│   └── main.py                     # API endpoints and business logic
├── 📂 data/                        # CSV datasets
│   ├── agriculture_data.csv
│   ├── health_data.csv
│   ├── traffice_data.csv
│   └── weather_data.csv
├── 📂 hellfire_club/               # React frontend
│   ├── 📂 public/                  # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── 📂 layout/          # Sidebar, Header
│   │   │   └── 📂 ui/              # Reusable UI components
│   │   ├── 📂 context/             # React Context API (CityContext)
│   │   ├── 📂 data/                # Mock data for fallback
│   │   ├── 📂 hooks/               # Custom React hooks
│   │   ├── 📂 pages/               # Route pages
│   │   │   ├── Overview.jsx
│   │   │   ├── Health.jsx
│   │   │   ├── Traffic.jsx
│   │   │   ├── Simulation.jsx
│   │   │   └── Agriculture.jsx
│   │   ├── 📂 services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── 📂 models/                      # ML model artifacts (optional)
└── 📂 notebooks/                   # Data analysis notebooks
    └── analysis.ipynb
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

<table>
<tr>
<th>Software</th>
<th>Minimum Version</th>
<th>Download Link</th>
</tr>
<tr>
<td>🟢 <strong>Node.js</strong></td>
<td>v18.0.0</td>
<td><a href="https://nodejs.org/">nodejs.org</a></td>
</tr>
<tr>
<td>📦 <strong>npm</strong></td>
<td>v9.0.0</td>
<td>Included with Node.js</td>
</tr>
<tr>
<td>🐍 <strong>Python</strong></td>
<td>v3.9+</td>
<td><a href="https://python.org/">python.org</a></td>
</tr>
<tr>
<td>📦 <strong>pip</strong></td>
<td>Latest</td>
<td>Included with Python</td>
</tr>
<tr>
<td>🔧 <strong>Git</strong></td>
<td>Latest</td>
<td><a href="https://git-scm.com/">git-scm.com</a></td>
</tr>
</table>

---

### 📥 Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/ohm-shahh/hellfire_club.git

# Or clone via SSH
git clone git@github.com:ohm-shahh/hellfire_club.git

# Navigate to project directory
cd hellfire_club
```

---

### 🐍 Step 2: Setup Backend (Python API)

#### Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pandas numpy scikit-learn python-multipart

# Or if you have requirements.txt:
pip install -r requirements.txt
```

#### Start FastAPI Server

```bash
# Run server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**✅ Expected Output:**
```
INFO:     Will watch for changes in these directories: ['/path/to/backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**🧪 Test API Health:**
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

---

### ⚛️ Step 3: Setup Frontend (React)

Open a **new terminal** window and keep the backend running.

```bash
# Navigate to frontend directory
cd hellfire_club

# Install dependencies
npm install

# Start development server
npm run dev
```

**✅ Expected Output:**
```
  VITE v7.2.4  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### 🌐 Step 4: Open in Browser

Navigate to **http://localhost:5173** in your web browser.

**🎉 You should see the Smart City Dashboard!**

---

## 🔧 Environment Variables

### Frontend Configuration

The frontend **does not require** a `.env` file. API configuration is in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

**📝 To change the API endpoint:**
1. Open `src/services/api.js`
2. Update `API_BASE_URL` to your backend URL
3. Save and restart the dev server

### Backend Configuration

If your backend needs environment variables, create a `.env` file in the `backend` directory:

```env
# Example .env file (optional)
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**⚠️ Important:** Never commit `.env` files to version control!

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Available Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### 2. Get Dashboard Data
```http
GET /api/dashboard?city={cityName}
```
**Parameters:**
- `city` (string): City name (e.g., "Ahmedabad", "Bangalore")

**Response:**
```json
{
  "city_name": "Ahmedabad",
  "overview_stats": { ... },
  "traffic": { ... },
  "health": { ... },
  "agriculture": { ... }
}
```

#### 3. Get Available Cities
```http
GET /api/cities
```
**Response:**
```json
{
  "cities": ["Ahmedabad", "Bangalore", "Mumbai", "Delhi"]
}
```

#### 4. Get Traffic Data Only
```http
GET /api/traffic?city={cityName}
```

#### 5. Get Health Data Only
```http
GET /api/health?city={cityName}
```

#### 6. Get Agriculture Data Only
```http
GET /api/agriculture?city={cityName}
```

### API Response Structure

See `src/data/mockData.js` for complete data structure examples.

---

## 📸 Screenshots

### Command Center (Overview)
<div align="center">
<img src="https://via.placeholder.com/1200x600/1e293b/3b82f6?text=Overview+Dashboard" alt="Overview Dashboard" width="100%">
<p><em>Real-time city statistics with critical alerts and risk visualization</em></p>
</div>

### Public Health Dashboard
<div align="center">
<img src="https://via.placeholder.com/1200x600/1e293b/ef4444?text=Health+Dashboard" alt="Health Dashboard" width="100%">
<p><em>Weather-disease correlation with hospital capacity forecasting</em></p>
</div>

### Traffic Monitoring
<div align="center">
<img src="https://via.placeholder.com/1200x600/1e293b/f59e0b?text=Traffic+Dashboard" alt="Traffic Dashboard" width="100%">
<p><em>24-hour congestion timeline with anomaly detection</em></p>
</div>

### Simulation Lab
<div align="center">
<img src="https://via.placeholder.com/1200x600/1e293b/8b5cf6?text=Simulation+Lab" alt="Simulation Dashboard" width="100%">
<p><em>Interactive scenario modeling with predictive analytics</em></p>
</div>

---

## ⚠️ Error Handling

### Backend Connection Issues

**Problem:** Frontend shows "Connection Error"

**Solution:**
1. ✅ Verify backend is running: `curl http://localhost:8000/health`
2. ✅ Check backend console for errors
3. ✅ Ensure no firewall blocking port 8000
4. ✅ Verify API URL in `src/services/api.js`

### CORS Issues

**Problem:** Browser console shows CORS errors

**Solution:**
Add CORS middleware in `backend/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Data Loading Issues

**Problem:** Empty charts or "No data available"

**Solution:**
1. ✅ Check CSV files in `data/` directory
2. ✅ Verify data format matches expected structure
3. ✅ Check backend logs for parsing errors
4. ✅ Ensure city name matches CSV data

---

## ⌨️ Keyboard Shortcuts

<table>
<tr>
<th>Shortcut</th>
<th>Action</th>
</tr>
<tr>
<td><kbd>Alt</kbd> + <kbd>1</kbd></td>
<td>Navigate to Overview</td>
</tr>
<tr>
<td><kbd>Alt</kbd> + <kbd>2</kbd></td>
<td>Navigate to Health Dashboard</td>
</tr>
<tr>
<td><kbd>Alt</kbd> + <kbd>3</kbd></td>
<td>Navigate to Traffic Dashboard</td>
</tr>
<tr>
<td><kbd>Alt</kbd> + <kbd>4</kbd></td>
<td>Navigate to Simulation Lab</td>
</tr>
<tr>
<td><kbd>Alt</kbd> + <kbd>5</kbd></td>
<td>Navigate to Agriculture Dashboard</td>
</tr>
</table>

---

## 🔒 Security

### ✅ Security Checklist

- ✅ **No hardcoded secrets** - All sensitive data managed via environment variables
- ✅ **API key management** - Handled server-side only
- ✅ **CORS configuration** - Properly configured for production
- ✅ **Input validation** - All user inputs sanitized
- ✅ **Error boundaries** - React error boundaries implemented
- ✅ **HTTPS ready** - Can be deployed with SSL/TLS
- ✅ **SQL injection prevention** - Using parameterized queries
- ✅ **XSS protection** - React's built-in escaping

### 🔐 Secrets Confirmation

**✅ This repository contains NO secrets:**
- ❌ No API keys in code
- ❌ No database credentials
- ❌ No authentication tokens
- ❌ No private keys

All sensitive configuration is handled via environment variables (not committed).

---

## 🎨 Development

### Run in Development Mode

```bash
# Frontend with hot reload
cd hellfire_club
npm run dev

# Backend with auto-reload
cd backend
uvicorn main:app --reload
```

### Build for Production

```bash
# Frontend production build
cd hellfire_club
npm run build

# Output: dist/ folder with optimized static files

# Preview production build locally
npm run preview
```

### Linting

```bash
# Run ESLint
cd hellfire_club
npm run lint
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository
Click the **Fork** button at the top right of this page.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/hellfire_club.git
cd hellfire_club
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 4. Make Your Changes
- Write clean, documented code
- Follow existing code style
- Add tests if applicable

### 5. Commit Your Changes
```bash
git add .
git commit -m "Add amazing feature"
```

### 6. Push to Your Fork
```bash
git push origin feature/amazing-feature
```

### 7. Open a Pull Request
Go to the original repository and click **New Pull Request**.

### Contribution Guidelines

- 📝 Write clear commit messages
- 🧪 Test your changes thoroughly
- 📖 Update documentation if needed
- 🎨 Follow the existing code style
- ✅ Ensure all tests pass

---

## 🧪 Testing

### Test Login Credentials

**ℹ️ This application does NOT require login credentials.**

The dashboard is designed for public access with city selection via the dropdown menu.

### Available Cities for Testing:
- 🏙️ **Ahmedabad** (default)
- 🌆 **Bangalore**
- 🏢 **Mumbai**
- 🌃 **Delhi**

Simply select a city from the header dropdown to switch contexts.

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

```
MIT License

Copyright (c) 2025 Ohm Shah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgments

### Open Source Libraries
- ⚛️ **React Team** - For the amazing UI library
- ⚡ **Vite Team** - For blazing-fast build tooling
- 🎨 **Tailwind Labs** - For utility-first CSS
- 📊 **Recharts** - For beautiful charting components
- 🎯 **Lucide** - For the icon library
- 🚀 **FastAPI** - For high-performance Python API

### Data Sources
- 🌐 Open city data initiatives
- 🏛️ Government open data portals
- 📊 Public health databases

---

## 📞 Contact & Support

### 👨‍💻 Developer
**Ohm Shah**  
📧 Email: Contact via GitHub  
🐙 GitHub: [@ohm-shahh](https://github.com/ohm-shahh)

### 🐛 Report Issues
Found a bug? [Open an issue](https://github.com/ohm-shahh/hellfire_club/issues/new)

### 💡 Request Features
Have an idea? [Start a discussion](https://github.com/ohm-shahh/hellfire_club/discussions)

### 📖 Documentation
Full documentation: [Wiki](https://github.com/ohm-shahh/hellfire_club/wiki)

---

## 🗺️ Roadmap

### 🎯 Upcoming Features

- [ ] 📱 Mobile app (React Native)
- [ ] 🗺️ Interactive map with Mapbox/Google Maps
- [ ] 🔔 Real-time notifications via WebSockets
- [ ] 📊 Advanced ML models for prediction
- [ ] 🌐 Multi-language support
- [ ] 📄 PDF report generation
- [ ] 🔐 User authentication and roles
- [ ] 📊 Historical data analysis
- [ ] 🌤️ Weather API integration
- [ ] 🚀 Kubernetes deployment configs

---

## 📊 Project Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/ohm-shahh/hellfire_club?style=social)
![GitHub forks](https://img.shields.io/github/forks/ohm-shahh/hellfire_club?style=social)
![GitHub issues](https://img.shields.io/github/issues/ohm-shahh/hellfire_club)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ohm-shahh/hellfire_club)
![GitHub last commit](https://img.shields.io/github/last-commit/ohm-shahh/hellfire_club)

</div>

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ for Smart Cities**

[⬆ Back to Top](#-hellfire-club---smart-city-intelligence-platform)

</div>