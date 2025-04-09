#!/bin/sh
# Cleanup script for MindfulMastery app

echo "Running cache cleanup..."
node clean-cache.js

echo "\nChecking dependencies..."
node check-dependencies.js

echo "\nRestarting app - please run one of these commands manually:"
echo "npx expo start --clear        # For Expo Go"
echo "npx expo start --no-dev --clear   # For production mode"
