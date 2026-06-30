# Vela - Impact Tracking App

A React Native/Expo app for tracking helmet impacts with real-time Bluetooth connectivity, local storage, and cloud sync.

## Features

- **Real-time Impact Tracking**: Connect via Bluetooth to your Vela helmet to track impacts in real-time
- **G-Force Monitoring**: Track gravitational forces (20-100+ G)
- **Rotational Measurement**: Monitor rotational acceleration (rad/s²)
- **Concussion Risk Alerts**: Automatic flagging of high-risk impacts
- **Session Management**: Create and manage impact sessions
- **Local Storage**: All data stored locally with AsyncStorage
- **Cloud Sync**: Optional Supabase sync for backup and cross-device access
- **Alert Log**: View all flagged impacts with risk assessments
- **History**: Browse past sessions and impacts

## Project Structure

```
vela-app/
├── app/                    # Screens (expo-router)
│   ├── index.tsx          # Home / current session
│   ├── history.tsx        # Trends over time
│   ├── impact/[id].tsx    # Single impact detail
│   ├── alerts.tsx         # Alert log
│   ├── pair.tsx           # Connect the helmet
│   └── account.tsx        # Settings
├── components/            # Reusable UI components
├── services/
│   ├── mockImpacts.ts     # Mock data generator
│   ├── ble.ts             # Bluetooth connectivity
│   ├── db.ts              # Local storage (AsyncStorage)
│   └── supabase.ts        # Cloud sync (optional)
├── hooks/
│   └── useHelmet.ts       # Helmet connection hook
└── store/
    └── index.ts           # Zustand state management
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** (optional for cloud sync)
   ```bash
   cp .env.example .env
   # Add your Supabase credentials if using cloud sync
   ```

3. **Start the app**
   ```bash
   npm start
   ```

4. **Run on device**
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## Helmet Pairing

1. Turn on your Vela helmet
2. Open the app and tap "Connect Helmet"
3. Select your helmet from the device list
4. Grant Bluetooth permissions when prompted
5. Once connected, impacts will stream in real-time

## Bluetooth Configuration

The BLE service expects:
- Service UUID: `12345678-1234-5678-1234-567812345678`
- Characteristic UUID: `87654321-4321-8765-4321-876543218765`

Update these UUIDs in `services/ble.ts` to match your helmet firmware spec.

## Concussion Risk Thresholds

Impacts are flagged based on:
- G-Force exceeding safety thresholds
- Rotational acceleration exceeding limits
- Combination of factors determined by the device firmware

Flagged impacts require user attention and medical evaluation.

## Cloud Sync (Optional)

Set up Supabase for cloud backup:

1. Create a Supabase project
2. Add your credentials to `.env`
3. Create a `sessions` table with:
   - `id` (text, primary key)
   - `user_id` (text)
   - `date` (timestamp)
   - `impacts` (json)

Cloud sync is optional - the app works fully offline with local storage.

## Development

### Mock Data
Test with mock data using `generateSession()` from `services/mockImpacts.ts`.

### State Management
Global state is managed with Zustand (`store/index.ts`).

### Local Storage
All sessions are persisted with AsyncStorage - data survives app restarts.

## License

Proprietary - Vela Impact Tracking
