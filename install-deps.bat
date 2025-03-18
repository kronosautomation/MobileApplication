@echo off
echo ===================================================
echo Installing Missing Dependencies
echo ===================================================

echo.
echo Installing expo-device...
call npm install expo-device

echo.
echo All dependencies installed successfully!
echo.
echo Now restart the application with:
echo restart-auth-api.bat