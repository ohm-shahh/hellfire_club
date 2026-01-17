🌆 Hellfire Club - Smart City Intelligence Platform
<div align="center">
<img alt="Smart City Dashboard" src="https://img.shields.io/badge/Smart_City-Dashboard-blue?style=for-the-badge">
<img alt="React" src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&amp;logo=react">
<img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&amp;logo=fastapi">
<img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&amp;logo=tailwind-css">
<img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge">
An AI-powered urban intelligence platform for real-time city monitoring, predictive analytics, and smart decision-making

🚀 Quick Start • ✨ Features • 🛠️ Tech Stack • 📸 Screenshots • 🤝 Contributing

</div>
📋 Table of Contents
Project Overview
Features
Tech Stack
Project Structure
Quick Start
Environment Variables
API Documentation
Screenshots
Error Handling
Keyboard Shortcuts
Security
Contributing
License

<br/>

🎯 Project Overview
Hellfire Club is a comprehensive smart city dashboard that leverages real-time data analytics, machine learning predictions, and interactive visualizations to help city administrators make informed decisions across multiple urban domains.

🌟 Why Hellfire Club?
📊 Real-time Monitoring: Live data from traffic, health, weather, and agriculture sensors
🤖 AI-Powered Insights: Machine learning models for disease outbreak prediction and traffic forecasting
🎮 Interactive Simulations: What-if scenario modeling for policy decisions
📱 Responsive Design: Works seamlessly on desktop, tablet, and mobile devices
🔒 Secure & Scalable: Built with modern security practices and scalable architecture
✨ Features
📊 Command Center (Overview)
<details> <summary>Click to expand</summary>
Real-time City Statistics: Live metrics across traffic, health, food prices, and weather
Critical Alerts System: Priority-based notifications for urgent city events
Composite Risk Map: Visual heatmap combining multiple risk factors
Multi-City Support: Switch between Ahmedabad, Bangalore, Mumbai, and Delhi
System Health Monitoring: Backend pipeline status and data freshness indicators
</details>
🏥 Public Health Intelligence
<details> <summary>Click to expand</summary>
Disease Outbreak Prediction: Correlation analysis between weather and disease cases
Environmental Risk Tracking: Real-time monitoring of humidity, temperature, and standing water
Hospital Capacity Planning: Predicted surge forecasting with 4-day lookahead
Interactive Visualizations: Dual-axis charts showing rainfall vs disease correlation
Risk Level Classification: Automatic categorization of health threats
</details>
🚗 Traffic & Urban Mobility
<details> <summary>Click to expand</summary>
24-Hour Congestion Timeline: Hourly traffic patterns with peak hour identification
Live Route Status: Color-coded severity indicators (Red/Yellow/Green)
AI Anomaly Detection: Automatic identification of unusual traffic patterns
Public Transport Integration: Real-time metro and bus network status
Average Speed Monitoring: Per-route speed tracking with historical comparisons
</details>
🔬 Simulation Laboratory
<details> <summary>Click to expand</summary>
Interactive Scenario Modeling: Adjust multiple parameters simultaneously
Parameter Controls:
🌧️ Rainfall Increase: 0-20% slider
🦟 Mosquito Control Budget: -10% to +100% adjustment
🛣️ Highway Closure: Toggle impact
Predictive Charts: Side-by-side baseline vs scenario comparison
Impact Metrics: Quantified effects on food prices, hospital load, and disease cases
What-If Analysis: Test policy decisions before implementation
</details>
🌾 Agriculture & Supply Chain
<details> <summary>Click to expand</summary>
Visual Supply Chain Flow: Farm → Transport → Warehouse → Consumer tracking
Price Volatility Analysis: 30-day price charts with spike detection
Spoilage Risk Alerts: Temperature and delay-based risk assessment
Market Inventory Dashboard: Real-time stock levels for wheat, vegetables, and fruits
Price Spike Reasoning: AI-generated explanations for market anomalies
</details>
🤖 AI Assistant
<details> <summary>Click to expand</summary>
Floating Chat Interface: Always accessible from any page
Context-Aware Responses: Understands current page and city context
Natural Language Queries: Ask questions in plain English
Quick Navigation: Suggested routes to relevant dashboards
Data Analysis: On-demand insights from city data
</details>
🛠️ Tech Stack
Frontend (hellfire_club/)
Technology	Version	Purpose
⚛️ React	19.2.0	UI Framework with hooks and context
⚡ Vite	7.2.4	Lightning-fast build tool with HMR
🎨 TailwindCSS	3.4.1	Utility-first CSS framework
🧭 React Router	7.12.0	Client-side routing
📊 Recharts	3.6.0	Composable charting library
🎯 Lucide React	0.562.0	Beautiful icon library
Backend (backend/)
Technology	Purpose
🐍 Python 3.9+	Backend runtime
🚀 FastAPI	High-performance async API framework
📊 Pandas	Data manipulation and analysis
🤖 Scikit-learn	Machine learning models
📈 NumPy	Numerical computing
Data Sources (data/)
🌦️ weather_data.csv - Temperature, humidity, rainfall, wind speed
🏥 health_data.csv - Disease cases, hospital visits, pollution levels
🚗 traffice_data.csv - Vehicle counts, congestion, incidents
🌾 agriculture_data.csv - Soil moisture, crop stages, pest risk
Development Tools
✅ ESLint - Code quality and consistency
🎨 PostCSS - CSS processing with Autoprefixer
📝 Jupyter Notebooks - Data analysis and model training

<hr/>
📁 Project Structure
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

🚀 Quick Start
Prerequisites
Before you begin, ensure you have the following installed:

Software	Minimum Version	Download Link
🟢 Node.js	v18.0.0	nodejs.org
📦 npm	v9.0.0	Included with Node.js
🐍 Python	v3.9+	python.org
📦 pip	Latest	Included with Python
🔧 Git	Latest	git-scm.com

<hr/>
📥 Step 1: Clone the Repository
# Clone via HTTPS
git clone https://github.com/ohm-shahh/hellfire_club.git

# Or clone via SSH
git clone git@github.com:ohm-shahh/hellfire_club.git

# Navigate to project directory
cd hellfire_club

<hr/>
🐍 Step 2: Setup Backend (Python API)
Install Python Dependencies
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
Start FastAPI Server
# Run server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

✅ Expected Output:

🧪 Test API Health:

⚛️ Step 3: Setup Frontend (React)
Open a new terminal window and keep the backend running.

# Navigate to frontend directory
cd hellfire_club

# Install dependencies
npm install

# Start development server
npm run dev

✅ Expected Output:

  VITE v7.2.4  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

🌐 Step 4: Open in Browser
Navigate to http://localhost:5173 in your web browser.

🎉 You should see the Smart City Dashboard!

<hr/>

🔧 Environment Variables
Frontend Configuration
The frontend does not require a .env file. API configuration is in api.js:

const API_BASE_URL = 'http://localhost:8000';

📝 To change the API endpoint:

Open api.js
Update API_BASE_URL to your backend URL
Save and restart the dev server
Backend Configuration
If your backend needs environment variables, create a .env file in the backend directory:

# Example .env file (optional)
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

⚠️ Important: Never commit .env files to version control!

<hr/>

📡 API Documentation
Base URL

http://localhost:8000

Available Endpoints
1. Health Check
GET /health
Response:
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z"
}

2. Get Dashboard Data
GET /api/dashboard?city={cityName}
Parameters:

city (string): City name (e.g., "Ahmedabad", "Bangalore")
Response:
{
  "city_name": "Ahmedabad",
  "overview_stats": { ... },
  "traffic": { ... },
  "health": { ... },
  "agriculture": { ... }
}

3. Get Available Cities
GET /api/cities
Response:
{
  "cities": ["Ahmedabad", "Bangalore", "Mumbai", "Delhi"]
}

4. Get Traffic Data Only
GET /api/traffic?city={cityName}
5. Get Health Data Only
GET /api/health?city={cityName}
6. Get Agriculture Data Only
GET /api/agriculture?city={cityName}
API Response Structure
See mockData.js for complete data structure examples.

📸 Screenshots
Command Center (Overview)
<img alt="Overview Dashboard" src="https://via.placeholder.com/1200x600/1e293b/3b82f6?text=Overview+Dashboard">
Real-time city statistics with critical alerts and risk visualization
Public Health Dashboard
<img alt="Health Dashboard" src="https://via.placeholder.com/1200x600/1e293b/ef4444?text=Health+Dashboard">
Weather-disease correlation with hospital capacity forecasting
Traffic Monitoring
<img alt="Traffic Dashboard" src="https://via.placeholder.com/1200x600/1e293b/f59e0b?text=Traffic+Dashboard">
24-hour congestion timeline with anomaly detection
Simulation Lab
<img alt="Simulation Dashboard" src="https://via.placeholder.com/1200x600/1e293b/8b5cf6?text=Simulation+Lab">
Interactive scenario modeling with predictive analytics
⚠️ Error Handling
Backend Connection Issues
Problem: Frontend shows "Connection Error"

Solution:

✅ Verify backend is running: curl http://localhost:8000/health
✅ Check backend console for errors
✅ Ensure no firewall blocking port 8000
✅ Verify API URL in api.js
CORS Issues
Problem: Browser console shows CORS errors

Solution: Add CORS middleware in main.py:

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Data Loading Issues
Problem: Empty charts or "No data available"

Solution:

✅ Check CSV files in data directory
✅ Verify data format matches expected structure
✅ Check backend logs for parsing errors
✅ Ensure city name matches CSV data
⌨️ Keyboard Shortcuts
Shortcut	Action
Alt + 1	Navigate to Overview
Alt + 2	Navigate to Health Dashboard
Alt + 3	Navigate to Traffic Dashboard
Alt + 4	Navigate to Simulation Lab
Alt + 5	Navigate to Agriculture Dashboard
🔒 Security
✅ Security Checklist
✅ No hardcoded secrets - All sensitive data managed via environment variables
✅ API key management - Handled server-side only
✅ CORS configuration - Properly configured for production
✅ Input validation - All user inputs sanitized
✅ Error boundaries - React error boundaries implemented
✅ HTTPS ready - Can be deployed with SSL/TLS
✅ SQL injection prevention - Using parameterized queries
✅ XSS protection - React's built-in escaping
🔐 Secrets Confirmation
✅ This repository contains NO secrets:

❌ No API keys in code
❌ No database credentials
❌ No authentication tokens
❌ No private keys
All sensitive configuration is handled via environment variables (not committed).

🎨 Development
Run in Development Mode
# Frontend with hot reload
cd hellfire_club
npm run dev

# Backend with auto-reload
cd backend
uvicorn main:app --reload
Build for Production
# Frontend production build
cd hellfire_club
npm run build

# Output: dist/ folder with optimized static files

# Preview production build locally
npm run preview
Linting
# Run ESLint
cd hellfire_club
npm run lint

<hr/>

🤝 Contributing
We welcome contributions! Please follow these steps:

1. Fork the Repository
Click the Fork button at the top right of this page.

2. Clone Your Fork
git clone https://github.com/YOUR_USERNAME/hellfire_club.git
cd hellfire_club
3. Create a Feature Branch
git checkout -b feature/amazing-feature
4. Make Your Changes
Write clean, documented code
Follow existing code style
Add tests if applicable
5. Commit Your Changes
git add .
git commit -m "Add amazing feature"
6. Push to Your Fork
git push origin feature/amazing-feature
7. Open a Pull Request
Go to the original repository and click New Pull Request.

Contribution Guidelines
📝 Write clear commit messages
🧪 Test your changes thoroughly
📖 Update documentation if needed
🎨 Follow the existing code style
✅ Ensure all tests pass
🧪 Testing
Test Login Credentials
ℹ️ This application does NOT require login credentials.

The dashboard is designed for public access with city selection via the dropdown menu.

Available Cities for Testing:
🏙️ Ahmedabad (default)
🌆 Bangalore
🏢 Mumbai
🌃 Delhi
Simply select a city from the header dropdown to switch contexts.

<hr/>

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

MIT License

Copyright (c) 2025 Ohm Shah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...

🙏 Acknowledgments
Open Source Libraries
⚛️ React Team - For the amazing UI library
⚡ Vite Team - For blazing-fast build tooling
🎨 Tailwind Labs - For utility-first CSS
📊 Recharts - For beautiful charting components
🎯 Lucide - For the icon library
🚀 FastAPI - For high-performance Python API
Data Sources
🌐 Open city data initiatives
🏛️ Government open data portals
📊 Public health databases

<hr/>
📞 Contact & Support
👨‍💻 Developer
Ohm Shah
📧 Email: Contact via GitHub
🐙 GitHub: @ohm-shahh

🐛 Report Issues
Found a bug? Open an issue

💡 Request Features
Have an idea? Start a discussion

📖 Documentation
Full documentation: Wiki

<hr/>

🗺️ Roadmap
🎯 Upcoming Features
 📱 Mobile app (React Native)
 🗺️ Interactive map with Mapbox/Google Maps
 🔔 Real-time notifications via WebSockets
 📊 Advanced ML models for prediction
 🌐 Multi-language support
 📄 PDF report generation
 🔐 User authentication and roles
 📊 Historical data analysis
 🌤️ Weather API integration
 🚀 Kubernetes deployment configs
📊 Project Stats
<img alt="GitHub stars" src="https://img.shields.io/github/stars/ohm-shahh/hellfire_club?style=social">
<img alt="GitHub forks" src="https://img.shields.io/github/forks/ohm-shahh/hellfire_club?style=social">
<img alt="GitHub issues" src="https://img.shields.io/github/issues/ohm-shahh/hellfire_club">
<img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/ohm-shahh/hellfire_club">
<img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ohm-shahh/hellfire_club">
<div align="center">
⭐ Star this repository if you find it helpful!
Made with ❤️ for Smart Cities

⬆ Back to Top

</div>