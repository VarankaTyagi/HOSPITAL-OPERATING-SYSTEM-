@echo off
title HospitalOS Launcher
echo ====================================================
echo          Starting HospitalOS Platform
echo ====================================================
echo.
echo 1. Starting Backend API (Port 4000)...
start "HospitalOS API" cmd /c "cd /d "%~dp0apps\api" && node dist/main.js"

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend Web Portal (Port 3000)...
start "HospitalOS Web" cmd /c "cd /d "%~dp0apps\web" && npm start"

timeout /t 4 /nobreak >nul

echo 3. Opening Browser...
start http://localhost:3000

echo.
echo ====================================================
echo   HospitalOS is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000/api
echo   Swagger:  http://localhost:4000/api/docs
echo ====================================================
