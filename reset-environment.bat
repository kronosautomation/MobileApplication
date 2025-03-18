@echo off
echo Performing complete reset of project environment...

:: Clear node_modules/.cache
echo Clearing node_modules/.cache...
rmdir /s /q node_modules\.cache 2>nul

:: Clear Metro cache
echo Clearing Metro cache...
rmdir /s /q "%TEMP%\metro-cache" 2>nul
rmdir /s /q "%TEMP%\haste-map-metro-*" 2>nul
rmdir /s /q "%TEMP%\metro-*" 2>nul

:: Clear watchman watches if available
echo Clearing watchman watches...
watchman watch-del-all 2>nul

:: Clear Expo cache
echo Clearing Expo cache...
rmdir /s /q "%USERPROFILE%\.expo" 2>nul

:: Create new babel.config.js
echo Creating minimal babel.config.js...
(
echo module.exports = function(api^) {
echo   api.cache(true^);
echo   return {
echo     presets: ['babel-preset-expo'],
echo   };
echo };
) > babel.config.js

:: Attempt to start with completely clean environment
echo ========================================
echo Starting with clean environment...
echo ========================================
set NODE_OPTIONS=--max-old-space-size=4096
npx expo start --clear --no-dev --minify
