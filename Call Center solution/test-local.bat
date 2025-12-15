@echo off
echo ========================================
echo M-Swasth Local Testing Environment
echo ========================================
echo.

echo [1/2] Starting Express Proxy Server (Port 3001)...
start "Exotel Proxy Server" cmd /k "node server.js"
timeout /t 3 /nobreak

echo [2/2] Starting React Development Server (Port 3000)...
start "React App" cmd /k "npm start"

echo.
echo ===================================
echo Servers are starting...
echo ===================================
echo.
echo Express Proxy: http://localhost:3001
echo React App:     http://localhost:3000
echo.
echo Both terminals will open in new windows.
echo Close those windows when done testing.
echo.
echo ===================================
echo.
pause
