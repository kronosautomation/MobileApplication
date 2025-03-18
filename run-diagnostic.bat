@echo off
echo Running Diagnostic App...

:: Clear node_modules/.cache to ensure clean builds
rmdir /s /q node_modules\.cache 2>nul

:: Clear Metro caches
echo Clearing Metro cache...
rmdir /s /q "%TEMP%\metro-cache" 2>nul
rmdir /s /q "%TEMP%\haste-map-metro-*" 2>nul
rmdir /s /q "%TEMP%\metro-*" 2>nul

:: Start expo with clean cache and extra logging
echo Starting Expo with diagnostic app...
set DEBUG=metro:*
npx expo start --clear
