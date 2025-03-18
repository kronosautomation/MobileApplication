# MindfulMastery Recovery Plan

This document outlines a systematic approach to restore the application after diagnosing the "Super expression must either be null or a function" error.

## Step 1: Verify Basic App Functionality

Run the diagnostic app using `run-diagnostic.bat`. If this works, we know:
- React Native core is functioning
- Metro bundler is working
- The application can register and render

## Step 2: Incremental Component Addition

If the diagnostic app works, we'll restore the full app component by component in this order:

1. **Basic App Structure** (App.tsx with basic layout only)
2. **Font Loading** (Add font loading logic)
3. **Basic Navigation** (Add NavigationContainer without routes)
4. **Context Providers** (Add one at a time in this order):
   - ThemeProvider
   - AuthProvider
   - SubscriptionProvider
5. **Error Handling** (Add simplified ErrorBoundary)
6. **Main Navigation** (Add AppNavigator)
7. **Services** (Add storage services initialization)

## Step 3: Dependency Resolution

If the error returns after adding specific components:

1. Examine component inheritance structure
2. Look for circular dependencies
3. Check versions of React/React Native packages
4. Reinstall problematic modules

## Step 4: Clear Caches Between Tests

After each step:
1. Clear Metro cache
2. Clear React Native cache
3. Restart bundler

## Step 5: Troubleshooting Techniques

If issues persist:
1. Try running on a different device/simulator
2. Verify node modules integrity
3. Check for conflicts in babel configuration
4. Look for TypeScript errors that might cause runtime problems

## Step 6: Full Restoration

Once we identify the specific component or dependency causing the issue, we can:
1. Replace it with a working alternative
2. Refactor the problematic code
3. Update dependencies to compatible versions

## Notes on Common Causes

1. Circular dependencies between context providers
2. Incorrect inheritance in class components
3. Version mismatches between React and React Native
4. Incompatible plugins or modules
5. Invalid imports causing components to be undefined

By following this systematic approach, we'll identify the exact source of the error and restore the application to full functionality.
