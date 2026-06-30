# Vela App Architecture

## Overview

Vela is a React Native/Expo application for real-time impact tracking from helmet-mounted sensors. It provides comprehensive monitoring, risk assessment, and data management capabilities.

## Technology Stack

- **Framework**: React Native 0.74 with Expo 51
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Local Storage**: AsyncStorage
- **Cloud Sync**: Supabase (optional)
- **Bluetooth**: react-native-ble-plx
- **Language**: TypeScript

## Directory Structure

```
vela-app/
├── app/                      # Screens (Expo Router)
│   ├── _layout.tsx          # Root layout, app initialization
│   ├── index.tsx            # Home screen
│   ├── history.tsx          # Session history
│   ├── impact/[id].tsx      # Individual impact detail
│   ├── alerts.tsx           # Flagged impacts log
│   ├── pair.tsx             # Helmet pairing
│   └── account.tsx          # Account settings
├── components/              # Reusable UI components
│   ├── ImpactCard.tsx       # Single impact display
│   ├── ImpactChart.tsx      # Impact visualization
│   └── StatsCard.tsx        # Statistics display
├── context/                 # React Context providers
│   └── AppContext.tsx       # Global app settings
├── hooks/                   # Custom hooks
│   └── useHelmet.ts         # Bluetooth connection logic
├── services/                # Data services
│   ├── ble.ts              # Bluetooth Low Energy
│   ├── db.ts               # Local AsyncStorage
│   ├── mockImpacts.ts      # Test data generator
│   └── supabase.ts         # Cloud sync (optional)
├── store/                   # Zustand state management
│   └── index.ts            # Global app state
└── utils/                   # Utility functions
    ├── analytics.ts        # Data analysis
    ├── export.ts           # Session export (JSON/CSV)
    ├── logger.ts           # Structured logging
    ├── notifications.ts    # Alert management
    ├── testing.ts          # Test data factories
    └── validation.ts       # Data validation
```

## Data Flow

### Impact Tracking Pipeline

1. **Hardware** → Bluetooth LE packets
2. **BLE Service** (`services/ble.ts`) → Decodes packets, validates data
3. **Validation** (`utils/validation.ts`) → Checks thresholds, sanitizes
4. **useHelmet Hook** → Routes impacts to state
5. **Zustand Store** → Updates global session
6. **UI Components** → Display/analyze impacts
7. **Database** → Persists to AsyncStorage
8. **Supabase** (optional) → Cloud sync

```
┌─────────────────────────┐
│  Helmet (Bluetooth)     │
└────────────┬────────────┘
             │
        ┌────▼────────────────┐
        │  BLE Manager        │
        │  (services/ble.ts)  │
        └────────┬────────────┘
                 │
        ┌────────▼──────────────┐
        │  Validation           │
        │  (utils/validation)   │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │  useHelmet Hook       │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │  Zustand Store        │
        └────────┬──────────────┘
                 │
        ┌────────┴──────────────┐
        │                       │
    ┌───▼──────┐          ┌────▼──────┐
    │   UI     │          │Database   │
    │(Components)         │(AsyncSync)│
    └──────────┘          └────┬──────┘
                                │
                         ┌──────▼──────┐
                         │  Supabase   │
                         │ (optional)  │
                         └─────────────┘
```

## Key Services

### BLE Service (`services/ble.ts`)

Manages Bluetooth connectivity:
- Device discovery (scans for Vela helmets)
- Connection/disconnection
- Characteristic subscription
- Packet decoding
- Error recovery

**UUIDs** (customize for your helmet):
```
Service:        12345678-1234-5678-1234-567812345678
Characteristic: 87654321-4321-8765-4321-876543218765
```

### Database Service (`services/db.ts`)

Local data persistence using AsyncStorage:
- Save/load sessions
- Add individual impacts
- Query by session ID
- Clear data

### Supabase Service (`services/supabase.ts`)

Optional cloud sync (requires configuration):
- Session upsert
- Fetch synced sessions
- User-specific queries
- Conflict resolution

### Mock Data (`services/mockImpacts.ts`)

Generates realistic test data for development:
- Random G-forces (20-100G)
- Random rotational acceleration
- 30% flagged for risk

## State Management

### Zustand Store (`store/index.ts`)

Global state:
```typescript
{
  sessions: Session[]           // All recorded sessions
  currentSession: Session       // Active session
  isConnected: boolean          // Helmet connection status
  isScanning: boolean           // BLE scan status
  userId: string | null         // Current user ID
}
```

## Utilities

### Analytics (`utils/analytics.ts`)

Computes session statistics:
- Total impacts
- Max/avg G-force
- Rotational metrics
- Risk percentage
- Severity classification
- Timeseries data

### Validation (`utils/validation.ts`)

- Impact threshold validation
- Concussion risk assessment
- Data sanitization
- Impact flagging logic

### Notifications (`utils/notifications.ts`)

Alert management:
- High impact notifications
- Connection status changes
- Persistent notification history
- Read/unread tracking

### Export (`utils/export.ts`)

Session export:
- JSON format (complete data)
- CSV format (spreadsheet-ready)
- Automatic filename generation

### Logging (`utils/logger.ts`)

Structured logging:
- DEBUG, INFO, WARN, ERROR levels
- Tag-based filtering
- Development-friendly format

## Extending the App

### Adding a New Screen

1. Create file in `app/`
2. Use Expo Router conventions (file-based routing)
3. Import store with `useStore()`
4. Export default component

```typescript
// app/newfeature.tsx
import { useRouter } from 'expo-router';
import { useStore } from '../store';

export default function NewFeatureScreen() {
  const router = useRouter();
  const { sessions } = useStore();
  
  return (
    // Your UI here
  );
}
```

### Adding a New Service

1. Create file in `services/`
2. Export interface and functions
3. Use logger utility for debugging

```typescript
// services/newsource.ts
import { logger } from '../utils/logger';

export async function getData() {
  logger.info('NewSource', 'Fetching data');
  // Implementation
}
```

### Adding Validation Rules

Extend `utils/validation.ts`:
```typescript
export const IMPACT_THRESHOLDS = {
  MIN_G_FORCE: 0,
  CUSTOM_THRESHOLD: 42,
  // ...
};
```

### Adding Analytics

Extend `utils/analytics.ts`:
```typescript
export function myCustomMetric(session: Session) {
  // Calculate metric
}
```

## Configuration

### Environment Variables

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### App Settings

Stored in AppContext (`context/AppContext.tsx`):
- Notification preferences
- Cloud sync toggle
- Custom thresholds
- Dark mode (prepared)

## Testing

Use mock data factories from `utils/testing.ts`:

```typescript
import { createMockSession, createHighRiskImpact } from '../utils/testing';

const session = createMockSession();
const impact = createHighRiskImpact();
```

## Performance Considerations

- **State Updates**: Zustand prevents unnecessary re-renders
- **Storage**: AsyncStorage is async; use try-catch
- **BLE**: Scanning consumes battery; limit scan duration
- **Notifications**: Limited to 100 most recent

## Security

- No sensitive data in logs (use logger level control)
- AsyncStorage is unencrypted; don't store credentials
- Supabase requires auth setup for production
- Validate all external data

## Troubleshooting

### Helmet not connecting
1. Check BLE UUIDs in `services/ble.ts`
2. Verify helmet is powered and nearby
3. Check `logger.ts` output for connection errors

### Data not persisting
1. Check AsyncStorage permissions
2. Verify disk space available
3. Clear cache: `npm run android -- --clear`

### Supabase sync not working
1. Verify environment variables are set
2. Check Supabase project is active
3. Ensure `sessions` table exists

## Future Enhancements

- [ ] User authentication
- [ ] Multi-device sync
- [ ] Advanced analytics dashboard
- [ ] Impact replay/visualization
- [ ] Integration with medical APIs
- [ ] Offline-first sync strategy
- [ ] Custom alert thresholds per user
- [ ] Data export scheduling
