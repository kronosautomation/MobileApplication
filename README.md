# MindfulMastery Mobile Application

A modern React Native mobile application for managing performance anxiety through guided meditation and mindfulness exercises.

## Features

- **User Authentication**: Secure login and registration
- **Guided Meditations**: Access to beginner and advanced guided meditations
- **Anxiety Journal**: Document and track your anxiety journey
- **Performance Tracking**: Monitor progress and improvements
- **Gamification**: Achievements, streaks, and rewards to encourage regular practice
- **Subscription Management**: RevenueCat integration for premium content access
- **Offline Access**: Download meditations for offline use
- **Personalized Recommendations**: AI-driven meditation suggestions based on user patterns

## Project Structure

- **assets/**: Static assets including images, fonts, and audio
- **src/**
  - **api/**: API service integration with backend
  - **components/**: Reusable UI components
  - **context/**: React context providers (auth, theme, etc.)
  - **hooks/**: Custom React hooks
  - **navigation/**: Navigation configuration
  - **screens/**: Application screens organized by feature
  - **store/**: State management using Zustand
  - **styles/**: Theme, colors, and global styles
  - **types/**: TypeScript type definitions
  - **utils/**: Utility functions and helpers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS: XCode and CocoaPods (for iOS development)
- Android: Android Studio and SDK (for Android development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd MobileApplication
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Follow the instructions in the terminal to run on iOS or Android

## Environment Configuration

The app uses environment variables for configuration:

- `.env.development`: Development environment settings
- `.env.production`: Production environment settings

Copy `.env.example` to create these files and fill in the appropriate values.

## RevenueCat Integration

This application uses RevenueCat for subscription management. Set up your RevenueCat account and configure the API keys in the environment files.

## Authentication & Security

The app integrates with the existing C# backend API for authentication using JWT tokens and secure storage.

## Contributing

Follow the standard Git workflow:

1. Create a feature branch
2. Implement changes
3. Submit a pull request

## License

Copyright © 2025. All rights reserved.
