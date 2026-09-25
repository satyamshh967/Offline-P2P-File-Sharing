@echo off
title FILEUP - Offline-First P2P File Sharing System
color 0b

echo ==============================================================
echo   FILEUP: Offline-First Peer-to-Peer File Sharing System
echo ==============================================================
echo.
echo [1/3] Starting Python Compression Service (Port 5000)...
start "Python Compression" cmd /k "python python-compression\compression_service.py"

echo [2/3] Starting Node.js Signaling & UDP Discovery Server (Port 3001)...
start "Node Signaling Server" cmd /k "node server\src\server.js"

echo [3/3] Starting React Web Client (Port 5173)...
start "React P2P Client" cmd /k "cd client && npm.cmd run dev"

echo.
echo All services launched!
echo Open your browser at: http://localhost:5173
echo Or open on your mobile/tablet on LAN at: http://<YOUR_LAN_IP>:5173
echo.
pause
