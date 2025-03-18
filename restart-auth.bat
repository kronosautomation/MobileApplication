@echo off
echo ===================================================
echo MindfulMastery Authentication Test
echo ===================================================
echo This script will restart the app with authentication implemented

echo.
echo Clearing Metro bundler cache...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q "%TEMP%\metro-cache" 2>nul

echo.
echo Starting the application...
call npx expo start --clear