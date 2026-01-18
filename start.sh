#!/bin/bash

echo "🚀 Starting Smart City Dashboard..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is running
echo "📊 Checking MySQL status..."
if ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${RED}❌ MySQL is not running!${NC}"
    echo "Starting MySQL..."
    brew services start mysql
    sleep 3
else
    echo -e "${GREEN}✅ MySQL is running${NC}"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo "🐍 Activating Python virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Setup database
echo "💾 Setting up database..."
mysql -u root -p < setup_database.sql

# Start Flask backend in background
echo "🔧 Starting Flask API server on port 2800..."
python app.py &
FLASK_PID=$!

# Wait for Flask to start
sleep 5

# Check if Flask is running
if ps -p $FLASK_PID > /dev/null; then
    echo -e "${GREEN}✅ Flask API is running (PID: $FLASK_PID)${NC}"
else
    echo -e "${RED}❌ Flask API failed to start${NC}"
    exit 1
fi

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start React frontend
echo "⚛️  Starting React frontend on port 5173..."
npm run dev

# Cleanup on exit
trap "echo 'Stopping servers...'; kill $FLASK_PID; exit" INT TERM
