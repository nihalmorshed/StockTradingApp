# Stock Trading App

React Native app with real-time stock tracking and loan calculator.

## Requirements

- Node v24.12
- Expo CLI
- Expo Go on physical device

## Setup

```bash
npm install
npx expo start
```

Press `a` for Android or `i` for iOS.

## Features

- Real-time stock prices via WebSocket (Finnhub Free API)
- Stock search with binary search algorithm
- Sort by price, change %, or volume
- Price history charts
- Multi-step (5) loan application form with calculations

## Dependencies

**Core**
- react: 19.1.0
- react-native: 0.81.5
- expo: ~54.0.30
- typescript: ~5.9.2

**Expo Packages**
- expo-router: ~6.0.21
- expo-status-bar: ~3.0.9
- expo-constants: ~18.0.12
- expo-linking: ~8.0.11
- expo-background-fetch: ~14.0.9
- expo-task-manager: ~14.0.9
- babel-preset-expo: ^54.0.9

**UI & Navigation**
- react-native-paper: ^5.14.5
- react-native-chart-kit: ^6.12.0
- react-native-svg: 15.12.1
- react-native-reanimated: ~4.1.1
- react-native-worklets: ^0.5.2
- react-native-gesture-handler: ~2.28.0
- react-native-screens: ~4.16.0
- react-native-safe-area-context: ~5.6.0
- @react-native-community/slider: ^5.1.1

**Data & Networking**
- socket.io-client: ^4.8.3
- @react-native-async-storage/async-storage: 2.2.0
- @react-native-community/netinfo: 11.4.1
- lodash: ^4.17.21

**Dev & Testing**
- jest: ^29.7.0
- jest-expo: ^54.0.16
- react-test-renderer: 19.1.0
- @testing-library/react-native: ^13.3.3
- @testing-library/jest-native: ^5.4.3
- @types/react: ~19.1.0
- @types/jest: ^29.5.14
- @types/lodash: ^4.17.21
