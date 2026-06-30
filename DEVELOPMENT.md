# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (for iOS development)
- Android: Android Studio (for Android development)

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd vela-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials (optional)

# Start the app
npm start
```

### Running on Device/Emulator

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Development Workflow

### Branch Naming

- Features: `feature/description`
- Bugs: `fix/description`
- Improvements: `improve/description`
- Docs: `docs/description`

### Commit Messages

Use conventional commits:
```
feat: add impact chart visualization
fix: resolve BLE connection timeout
docs: update setup instructions
refactor: simplify analytics calculations
test: add mock data factories
```

### Code Style

- Use TypeScript strict mode
- Follow React hooks best practices
- Keep components focused and testable
- Use meaningful variable names
- Add comments for non-obvious logic

### Testing

#### Unit Tests

```typescript
import { calculateSessionStats } from '../utils/analytics';
import { createMockSession } from '../utils/testing';

test('calculates session stats correctly', () => {
  const session = createMockSession();
  const stats = calculateSessionStats(session);
  expect(stats.totalImpacts).toBe(session.impacts.length);
});
```

#### Integration Tests

Test data flow end-to-end using mock data:
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useHelmet } from '../hooks/useHelmet';
import { createMockSession } from '../utils/testing';
```

### Debugging

#### Enable Debug Logging

In `utils/logger.ts`:
```typescript
const currentLogLevel = LogLevel.DEBUG; // Changed from INFO
```

#### React DevTools

```bash
npm install -g react-devtools
react-devtools
```

Then inspect your app in Expo.

#### Bluetooth Debugging

Enable BLE logs in `services/ble.ts`. Monitor all connect/disconnect/data events.

## Common Tasks

### Adding a Feature

1. Create a feature branch
2. Implement the feature in a focused component/service
3. Add tests using mock data
4. Update documentation if needed
5. Submit PR with description

Example: Add session filtering

```typescript
// utils/analytics.ts - Add filter function
export function filterSessionsByDate(sessions: Session[], daysBack: number) {
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  return sessions.filter(s => s.date > cutoff);
}

// hooks/useHelmet.ts - Expose in hook if needed
const filteredSessions = filterSessionsByDate(sessions, 7);

// components/SessionList.tsx - Use in component
<FlatList
  data={filteredSessions}
  renderItem={renderSession}
/>
```

### Fixing a Bug

1. Locate the bug (use logger for traces)
2. Write a test that reproduces it
3. Fix the bug
4. Verify test passes
5. Add regression test

### Updating Types

```typescript
// Update the type definition
export interface Impact {
  id: string;
  timestamp: number;
  gForce: number;
  rotational: number;
  flagged: boolean;
  newField?: string; // Add with optional
}

// Update validation
export function validateImpact(impact: any): impact is Impact {
  // ... existing checks
  // Add check for new field if required
}

// Update mock data
export function createMockImpact(overrides?: Partial<Impact>): Impact {
  return {
    // ... existing fields
    newField: 'default',
    ...overrides,
  };
}
```

### Adding Analytics

```typescript
// utils/analytics.ts
export function calculateNewMetric(session: Session): number {
  const metric = session.impacts.reduce((sum, impact) => {
    return sum + impact.gForce;
  }, 0);
  return metric / session.impacts.length;
}

// screens/MyScreen.tsx
import { calculateNewMetric } from '../utils/analytics';

const metric = calculateNewMetric(currentSession);
```

## Performance Tips

### Component Optimization

Use `React.memo` for expensive components:
```typescript
export const ImpactCard = React.memo(function ImpactCard({ impact, onPress }) {
  return (
    // Component JSX
  );
});
```

### State Optimization

Keep Zustand state minimal:
```typescript
// Good - minimal, derived data computed as needed
const { sessions } = useStore();
const stats = calculateSessionStats(sessions[0]);

// Avoid - don't store derived data
// { sessions, stats } // Don't do this
```

### List Optimization

Use `FlatList` with `keyExtractor`:
```typescript
<FlatList
  data={impacts}
  renderItem={({ item }) => <ImpactCard impact={item} />}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={20}
  updateCellsBatchingPeriod={50}
/>
```

## Bluetooth Development

### Testing Without Hardware

Use mock data generator:
```typescript
const session = generateSession(); // Simulates impacts
// Doesn't require actual helmet
```

### Adding New BLE Characteristics

```typescript
// services/ble.ts
const NEW_CHARACTERISTIC_UUID = 'xxxxx';

private async subscribeToNewData(): Promise<void> {
  this.device.monitorCharacteristicForService(
    HELMET_SERVICE_UUID,
    NEW_CHARACTERISTIC_UUID,
    (error, char) => {
      // Handle data
    }
  );
}
```

## API Integration

### Adding Supabase Features

```typescript
// services/supabase.ts
export async function fetchUserData(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
```

### Error Handling

```typescript
try {
  const data = await fetchData();
  logger.info('DataService', 'Data fetched');
} catch (error) {
  logger.error('DataService', 'Failed to fetch', error);
  // Show user-friendly error
  throw new AppError('Failed to load data', 'DATA_FETCH_ERROR');
}
```

## Documentation

### Code Comments

Use comments sparingly, only for non-obvious logic:
```typescript
// Good: explains WHY
// BLE requires base64 decoding of characteristic values
const decoded = Buffer.from(char.value, 'base64');

// Avoid: explains WHAT (code is clear)
// Decode the characteristic value
const decoded = Buffer.from(char.value, 'base64');
```

### README Sections

Update README.md when:
- Adding setup steps
- Changing dependencies
- Adding new features
- Documenting new UUIDs

## Release Checklist

- [ ] Version bumped in `app.json`
- [ ] CHANGELOG updated
- [ ] Tests pass
- [ ] Docs updated
- [ ] No console warnings
- [ ] Performance tested
- [ ] Bluetooth tested on hardware
- [ ] Android and iOS tested
- [ ] Git tags created

## Useful Commands

```bash
# Clear cache
npm run android -- --clear

# Check TypeScript
npx tsc --noEmit

# Format code
npx prettier --write .

# Lint (if ESLint added)
npx eslint . --ext .ts,.tsx

# Clean node_modules
rm -rf node_modules && npm install

# Reset Expo cache
expo start --clear
```

## Troubleshooting Development

### Blank screen on startup

```bash
# Hard reset
npm start -- --clear
rm -rf .expo
```

### Module not found

```bash
# Reinstall
rm -rf node_modules
npm install
```

### Bluetooth not working

1. Check device is powered on
2. Verify correct UUIDs in `services/ble.ts`
3. Check permission requests
4. See Bluetooth debugging section

### Slow performance

1. Check logger level (shouldn't be DEBUG in production)
2. Profile with React DevTools
3. Use React.memo on expensive components
4. Reduce FlatList data volume

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [BLE-PLX](https://github.com/Polidea/react-native-ble-plx)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
