@echo off
echo ===================================================
echo MindfulMastery Complete App Restart
echo ===================================================
echo This script will restart the app with all implemented features

echo.
echo Clearing Metro bundler cache...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q "%TEMP%\metro-cache" 2>nul

echo.
echo Starting the application...
call npx expo start --clear