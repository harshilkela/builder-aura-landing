#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Skill Swap Platform Development Environment${NC}"
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Please start MongoDB first:${NC}"
    echo "   mongod"
    echo ""
    echo -e "${YELLOW}   Or if using systemctl:${NC}"
    echo "   sudo systemctl start mongod"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ MongoDB is running${NC}"

# Check if required directories exist
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi

# Check if dependencies are installed
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

# Check for environment files
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found. Creating from example...${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}   Please edit backend/.env with your configuration${NC}"
    else
        echo -e "${RED}❌ backend/.env.example not found${NC}"
    fi
fi

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating frontend .env.local file...${NC}"
    echo "VITE_API_URL=http://localhost:5000/api" > .env.local
fi

echo ""
echo -e "${BLUE}🎯 Starting development servers...${NC}"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down development servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to call cleanup function on script termination
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${GREEN}🔧 Starting backend server on http://localhost:5000${NC}"
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo -e "${GREEN}🎨 Starting frontend server on http://localhost:8080${NC}"
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Development environment is ready!${NC}"
echo ""
echo -e "${BLUE}📖 URLs:${NC}"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:5000/api"
echo "   API Docs: http://localhost:5000/api"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for all background processes
wait