@echo off
echo Starting app with enhanced debugging...

:: Clear caches
echo Clearing caches...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q "%TEMP%\metro-cache" 2>nul
rmdir /s /q "%TEMP%\haste-map-metro-*" 2>nul

:: Set environment for better error reporting
set DEBUG=metro:*
set NODE_OPTIONS=--trace-warnings

:: Start Expo with extra debugging flags
echo Starting Expo with debugging enabled...
npx expo start --clear --dev
