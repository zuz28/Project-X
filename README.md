# Vela - Impact Tracking Application

A beautiful, Apple-designed mobile app for tracking head impacts in sports and athletic activities. Built with React Native, Expo, and designed following Apple's Human Interface Guidelines.

## Features

### Real-time Impact Tracking
- **BLE Helmet Integration**: Connect your Vela helmet via Bluetooth for live impact detection
- **Real-time Alerts**: Instant notifications when impacts are detected
- **Live Visualization**: See impacts as they happen with animated alerts

### Session Management
- **Session History**: View all past training sessions with detailed metrics
- **Session Analytics**: Deep dive into individual sessions with impact breakdown
- **Session Export**: Export data as CSV for external analysis

### Safety & Health
- **Risk Assessment**: Automatic risk level calculation based on impact data
- **Health Insights**: Personalized recommendations based on impact patterns
- **Critical Impact Alerts**: Immediate notifications for high-force impacts
- **Medical Recommendations**: Guidance for when to seek medical evaluation

### Data & Analytics
- **All-time Statistics**: Comprehensive overview of cumulative impact data
- **G-Force Analysis**: Track linear acceleration metrics
- **Rotational Force Tracking**: Monitor rotational impact measurements
- **Trend Analysis**: Visual trends over time

### Device Management
- **Device Pairing**: Easy setup for connecting Vela helmets
- **Connection Status**: Always know when your helmet is connected
- **Device Settings**: Configure notification thresholds and alerts
- **Multiple Device Support**: Easy switching between helmets

## Design System

### Colors
- **Primary**: Apple Blue (#0066FF)
- **Success**: Green (#34C759)
- **Warning**: Orange (#FF9500)
- **Danger**: Red (#FF3B30)
- **Backgrounds**: White (#FFFFFF) & Light Gray (#F5F5F7)

### Typography
- System fonts with 11pt–40pt range
- Careful weight hierarchy for readability
- Optimized line heights for mobile

### Spacing & Animation
- Consistent spacing scale from 4px to 40px
- Smooth animations: 150ms (fast), 300ms (normal), 500ms (slow)
- Apple-style transitions throughout

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Architecture

- **State Management**: Zustand for lightweight global state
- **Routing**: Expo Router for nested navigation
- **Local Storage**: AsyncStorage for data persistence
- **Hardware**: BLE Service for Bluetooth helmet connectivity

## Impact Levels

- **≤ 25G**: Normal
- **25-40G**: Moderate
- **40-60G**: High (monitor symptoms)
- **> 60G**: Critical (seek medical evaluation)

## Safety Disclaimer

This app is for tracking purposes only. Always consult healthcare professionals about head injuries. This app does not replace medical advice.
