## 🌆 Smart City Dashboard - Urban Intelligence Platform
<div align="center">
<img alt="Smart City Dashboard" src="https://img.shields.io/badge/Smart_City-Dashboard-blue?style=for-the-badge">
<img alt="React" src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&amp;logo=react">
<img alt="Vite" src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&amp;logo=vite">
<img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&amp;logo=tailwind-css">
<img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge">
A modern, real-time urban intelligence dashboard for smart city monitoring and management

Demo • Features • Tech Stack • Installation • Documentation

</div>
📋 Project Overview
Smart City Dashboard is a comprehensive web application designed to monitor and analyze critical urban infrastructure data in real-time. Built with modern React and powered by FastAPI backend, it provides city administrators and stakeholders with actionable insights across multiple domains.

🎯 Key Objectives
🚦 Traffic Management: Real-time congestion monitoring and route optimization
🏥 Public Health: Disease outbreak tracking and environmental health monitoring
🌾 Agriculture & Supply Chain: Food security and price volatility analysis
🔬 Predictive Simulation: What-if scenario modeling for policy decisions
🤖 AI-Powered Insights: Intelligent assistant for data analysis
✨ Features
📊 Command Center (Overview)
Real-time city statistics dashboard
Critical alerts and notifications system
Composite risk map visualization
Multi-city support with dynamic switching
System health monitoring
🏥 Public Health Monitoring
Weather-disease correlation analysis
Environmental risk factor tracking (humidity, temperature, standing water)
Hospital capacity and predicted surge forecasting
Interactive dual-axis charts for rainfall vs disease cases
🚗 Traffic & Urban Mobility
24-hour congestion timeline visualization
Live route status tracking (color-coded by severity)
Traffic anomaly detection with AI alerts
Public transport status integration
Average speed monitoring per route
🔬 Simulation Lab
Interactive scenario modeling
Adjustable parameters:
Rainfall increase (0-20%)
Mosquito control budget (-10% to +100%)
Highway closure toggle
Predictive impact charts
Side-by-side baseline vs scenario comparison
🌾 Agriculture & Supply Chain
Visual supply chain flow tracking (Farm → Transport → Warehouse → Consumer)
30-day price volatility charts
Spoilage risk alerts based on environmental conditions
Market inventory status (wheat, vegetables, fruits)
Price spike detection and reasoning
🤖 AI Assistant
Floating chat interface
Context-aware data analysis
Natural language queries
Quick navigation suggestions
🛠️ Tech Stack
Frontend
Technology	Version	Purpose
<img alt="React" src="https://img.shields.io/badge/-React-61DAFB?logo=react&amp;logoColor=white">
19.2.0	UI Framework
<img alt="Vite" src="https://img.shields.io/badge/-Vite-646CFF?logo=vite&amp;logoColor=white">
7.2.4	Build Tool
<img alt="TailwindCSS" src="https://img.shields.io/badge/-Tailwind-38B2AC?logo=tailwind-css&amp;logoColor=white">
3.4.1	Styling
<img alt="React Router" src="https://img.shields.io/badge/-React_Router-CA4245?logo=react-router&amp;logoColor=white">
7.12.0	Routing
<img alt="Recharts" src="https://img.shields.io/badge/-Recharts-FF6B6B">
3.6.0	Data Visualization
<img alt="Lucide React" src="https://img.shields.io/badge/-Lucide-F56565">
0.562.0	Icon Library
Backend API
Python FastAPI (localhost:8000)
RESTful endpoints for city data
Real-time data aggregation
Development Tools
ESLint (code quality)
PostCSS + Autoprefixer
Vite Hot Module Replacement (HMR)
🚀 Installation
Prerequisites
Node.js: v18.0.0 or higher
npm: v9.0.0 or higher
Python: v3.9+ (for backend API)
Git
📥 Clone Repository
📦 Install Dependencies
🔧 Environment Variables
This project does not require environment variables for the frontend. The API base URL is configured in api.js:

⚠️ If you need to change the API endpoint, edit this file directly.

🏃 How to Run Locally
1️⃣ Start the Backend API (Required)
The frontend depends on a Python FastAPI backend. Navigate to your backend directory:

Expected Output:

2️⃣ Start the Frontend Development Server
In a new terminal, from the hellfire_club directory:

Expected Output:

3️⃣ Open in Browser
Navigate to http://localhost:5173 in your web browser.

🧪 Test Credentials
This application does not require login credentials. It's designed for public dashboard access. City selection is available via the dropdown in the header.

Available Cities:
🏙️ Ahmedabad (default)
🌆 Bangalore
🏢 Mumbai
🌃 Delhi
📱 Application Structure
🎨 Key Features Showcase
🔄 Real-Time Data Refresh
Click the refresh icon (🔄) in the header to reload city data.

⌨️ Keyboard Shortcuts
Alt + 1: Overview
Alt + 2: Health
Alt + 3: Traffic
Alt + 4: Simulation
Alt + 5: Agriculture
🌈 Responsive Design
Fully responsive layout with mobile, tablet, and desktop breakpoints.

🎭 Dark Mode
Modern dark theme with glassmorphism effects and smooth animations.

⚠️ Error Handling
Backend Connection Issues
If you see this error:

Solution:

Verify backend is running on http://localhost:8000
Check backend console for errors
Test API health: curl http://localhost:8000/health
Data Loading States
Loading Spinner: Displayed during data fetch
Error Boundary: Graceful error messages
Fallback UI: Skeleton loaders for better UX
🔒 Security & Best Practices
✅ No secrets in repository - All sensitive data managed via backend
✅ API key management - Handled server-side
✅ CORS configuration - Properly configured in backend
✅ Input validation - All user inputs sanitized
✅ Error boundaries - React error boundaries implemented

📚 Documentation
API Endpoints Used
Endpoint	Method	Description
/api/dashboard?city={name}	GET	Full dashboard data
/api/cities	GET	Available cities list
/api/overview?city={name}	GET	Overview statistics
/api/traffic?city={name}	GET	Traffic data
/api/health?city={name}	GET	Health data
/api/agriculture?city={name}	GET	Agriculture data
/health	GET	API health check
Component Documentation
See inline JSDoc comments in:

api.js - API service layer
CityContext.jsx - Global state management
mockData.js - Data structure examples
🔧 Build for Production
Output: Optimized static files in dist/ directory.

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create feature branch (git checkout -b feature/AmazingFeature)
Commit changes (git commit -m 'Add AmazingFeature')
Push to branch (git push origin feature/AmazingFeature)
Open a Pull Request
📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Recharts - Beautiful React chart library
Lucide React - High-quality icon set
TailwindCSS - Utility-first CSS framework
Vite - Next-generation frontend tooling
📞 Contact & Support
Developer: Ohm Shah
Repository: hellfire_club
Issues: Report Bug

<div align="center">
⭐ Star this repository if you find it helpful!
Made with ❤️ for Smart Cities

</div>