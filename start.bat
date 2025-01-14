@echo off
cd /d "C:\Users\markel\FreakBoB\backup\project"

echo Starting Next.js development server...
start /b cmd /c "npm run dev > temp.txt 2>&1"

:WAITLOOP
timeout /t 1 /nobreak > nul
findstr /m "Ready" temp.txt > nul
if errorlevel 1 goto :WAITLOOP

echo Server is ready! Opening browser...
start http://localhost:3000

:: Wait a moment before trying to delete
timeout /t 2 /nobreak > nul
del /f temp.txt 2>nul
if exist temp.txt (
    :: If file still exists, just hide the error
    exit /b 0
) 