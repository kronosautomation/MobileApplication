@echo off
echo ===================================================
echo MindfulMastery Rebuild Script
echo ===================================================
echo This script will rebuild your application with the new changes

echo.
echo Step 1: Clearing Metro bundler cache
echo ---------------------------------------------------
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q "%TEMP%\metro-cache" 2>nul
rmdir /s /q "%TEMP%\haste-map-metro-*" 2>nul
echo Cache cleared successfully!

echo.
echo Step 2: Removing AsyncStorage incompatible version
echo ---------------------------------------------------
call npm uninstall @react-native-async-storage/async-storage

echo.
echo Step 3: Installing compatible AsyncStorage version
echo ---------------------------------------------------
call npm install @react-native-async-storage/async-storage@~1.18.2

echo.
echo Step 4: Cleaning node_modules (this may take a few minutes)
echo ---------------------------------------------------
call npm run clean-install

echo.
echo Step 5: Starting the application
echo ---------------------------------------------------
echo Your app should now start correctly with the fixed implementation
echo Starting Expo in development mode...
call npx expo start --clear

echo.
echo If you still encounter issues, please try:
echo 1. Running 'npm install' again
echo 2. Making sure the AsyncStorage version is ~1.18.2
echo 3. Check the logs for more detailed error information
