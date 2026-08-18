#!/bin/bash

# Start script for Club Management app
# Starts PostgreSQL, backend, and frontend

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Stopped all services.${NC}"
}

trap cleanup EXIT INT TERM

# Check PostgreSQL
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if ! pg_isready -q; then
    echo -e "${RED}PostgreSQL is not running. Start it with: sudo systemctl start postgresql${NC}"
    exit 1
fi
echo -e "${GREEN}PostgreSQL is running.${NC}"

# Start backend
echo -e "${YELLOW}Starting backend on port 5000...${NC}"
cd "$(dirname "$0")/server"
npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend
echo -e "${YELLOW}Starting frontend on port 5173...${NC}"
cd "$(dirname "$0")/client"
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}Both servers started!${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:5173/${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:5000/api/v1/health${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both.${NC}"

wait
