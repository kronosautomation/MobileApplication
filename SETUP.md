# MindfulMastery Mobile Application Setup

This document provides instructions for setting up and running the MindfulMastery mobile application.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Git

## Environment Setup

### 1. Clone the Repository

If you haven't already, clone the repository:

```bash
git clone <repository-url>
cd MindfulMastery/MobileApplication
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env.development
```

Edit `.env.development` and update the following values:

- `API_BASE_URL`: URL of your backend API
- `REVENUECAT_API_KEY_ANDROID`: RevenueCat API key for Android
- `REVENUECAT_API_KEY_IOS`: RevenueCat API key for iOS

### 4. Add Required Assets

The app requires certain assets to be present:

1. Place your logo at `assets/images/logo.png`
2. Place your welcome background at `assets/images/welcome-bg.jpg`
3. Place the required font files in `assets/fonts/`:
   - Inter-Regular.ttf
   - Inter-Medium.ttf
   - Inter-SemiBold.ttf
   - Inter-Bold.ttf
4. Place animation files in `assets/animations/`:
   - meditation.json
   - achievement.json

You can download the Inter font from [Google Fonts](https://fonts.google.com/specimen/Inter).

## Running the App

### Development Mode

Start the development server:

```bash
npm start
# or
yarn start
```

### Running on iOS Simulator (macOS only)

```bash
npm run ios
# or
yarn ios
```

### Running on Android Emulator

```bash
npm run android
# or
yarn android
```

### Running on Physical Device

1. Install the Expo Go app on your device
2. Scan the QR code shown in the terminal after running `npm start`

## Project Structure

- `assets/`: Static assets including images, fonts, and animation files
- `src/api/`: API service integration with backend
- `src/components/`: Reusable UI components
- `src/context/`: React context providers
- `src/hooks/`: Custom React hooks
- `src/navigation/`: Navigation configuration
- `src/screens/`: Application screens
- `src/store/`: State management using Zustand
- `src/styles/`: Theme, colors, and global styles
- `src/types/`: TypeScript type definitions
- `src/utils/`: Utility functions and helpers

## RevenueCat Integration

This application uses RevenueCat for subscription management. To set up RevenueCat:

1. Create an account at [RevenueCat](https://www.revenuecat.com/)
2. Create a new project and get your API keys
3. Configure your subscription offerings in the RevenueCat dashboard
4. Update your environment variables with the API keys

For more details, refer to the `RevenueCat_Setup.md` in the root directory.

## Connection to Backend API

The mobile app connects to the C# backend API for authentication, data retrieval, and other functionality. Ensure the backend is running and accessible from your development environment.

The API connection is configured in `src/api/apiClient.ts`.

## Building for Production

### 1. Configure Production Environment

```bash
cp .env.example .env.production
```

Edit `.env.production` with your production settings.

### 2. Build for iOS

```bash
expo build:ios
```

### 3. Build for Android

```bash
expo build:android
```

## Troubleshooting

If you encounter issues with the application, try the following:

1. Clear the npm cache: `npm cache clean --force`
2. Delete the `node_modules` folder and reinstall dependencies
3. Reset the Metro bundler cache: `npm start -- --reset-cache`
4. Ensure the backend API is running and accessible
5. Check the React Native and Expo documentation for environment-specific issues

## Support

For questions or issues related to the MindfulMastery mobile application, please contact the development team.
