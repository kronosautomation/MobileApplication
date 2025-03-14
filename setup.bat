@echo off
echo Cleaning up node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json

echo Installing dependencies with legacy peer deps...
npm install --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
  echo First installation attempt failed, trying with force flag...
  npm install --force
)

if %ERRORLEVEL% NEQ 0 (
  echo Second installation attempt failed.
  echo Please try running: npm install --legacy-peer-deps --verbose
  echo Or try using Yarn: yarn install
  exit /b 1
)

echo Installation completed successfully!
