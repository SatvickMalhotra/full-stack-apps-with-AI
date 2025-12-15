#!/bin/bash

echo "========================================"
echo "M-Swasth Local Testing Environment"
echo "========================================"
echo ""

echo "[1/2] Starting Express Proxy Server (Port 3001)..."
node server.js &
PROXY_PID=$!
sleep 3

echo "[2/2] Starting React Development Server (Port 3000)..."
npm start &
REACT_PID=$!

echo ""
echo "==================================="
echo "Servers are running..."
echo "==================================="
echo ""
echo "Express Proxy: http://localhost:3001"
echo "React App:     http://localhost:3000"
echo ""
echo "==================================="
echo ""
echo "Press Ctrl+C to stop all servers..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $PROXY_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    echo "Servers stopped. Goodbye!"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for both processes
wait
