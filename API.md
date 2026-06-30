# Vela App API Documentation

## Services

### BLE Service (`services/ble.ts`)

Manages Bluetooth Low Energy communication with the Vela helmet.

#### Classes

##### `HelmetBLE`

Main class for Bluetooth management.

```typescript
class HelmetBLE {
  async startScan(): Promise<Device[]>
  async connect(device: Device): Promise<void>
  async disconnect(): Promise<void>
  onImpactReceived(callback: (impact: Impact) => void): void
  isConnected(): boolean
}
```

#### Methods

##### `startScan()`

Scans for available Vela helmets.

```typescript
const helmet = new HelmetBLE();
const devices = await helmet.startScan();
// Returns: [{ id: 'ABC123', name: 'Vela Helmet', ... }]
```

**Parameters:** None

**Returns:** `Promise<Device[]>` - Array of discovered devices

**Duration:** 10 seconds

##### `connect(device: Device)`

Connects to a discovered helmet device.

```typescript
await helmet.connect(device);
```

**Parameters:**
- `device: Device` - Device object from `startScan()`

**Returns:** `Promise<void>`

**Throws:**
- Connection timeout error
- Device not found error
- Service discovery failure

##### `disconnect()`

Safely disconnects from the helmet.

```typescript
await helmet.disconnect();
```

**Parameters:** None

**Returns:** `Promise<void>`

##### `onImpactReceived(callback)`

Registers callback for impact events.

```typescript
helmet.onImpactReceived((impact) => {
  console.log(`Impact: ${impact.gForce}G`);
});
```

**Parameters:**
- `callback: (impact: Impact) => void` - Function called for each impact

**Returns:** `void`

##### `isConnected()`

Checks connection status.

```typescript
if (helmet.isConnected()) {
  console.log('Helmet connected');
}
```

**Returns:** `boolean`

### Database Service (`services/db.ts`)

Local data persistence using AsyncStorage.

#### Functions

##### `saveSessions(sessions: Session[])`

Persists sessions to local storage.

```typescript
await saveSessions([session1, session2]);
```

##### `getSessions()`

Retrieves all stored sessions.

```typescript
const sessions = await getSessions();
// Returns: Session[]
```

##### `addSession(session: Session)`

Adds a new session to storage.

```typescript
await addSession(newSession);
```

##### `getSession(id: string)`

Retrieves a specific session.

```typescript
const session = await getSession('session-123');
```

##### `clearSessions()`

Clears all stored data.

```typescript
await clearSessions();
```

### Supabase Service (`services/supabase.ts`)

Cloud data sync (optional).

#### Configuration

```typescript
// Environment variables required
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Functions

##### `syncSession(session: Session, userId: string)`

Syncs a session to Supabase.

```typescript
await syncSession(currentSession, userId);
```

##### `getSyncedSessions(userId: string)`

Retrieves synced sessions from cloud.

```typescript
const cloudSessions = await getSyncedSessions(userId);
```

## Hooks

### `useHelmet()`

Connects UI to Bluetooth functionality.

```typescript
const { isConnected, startScan, connectToHelmet, disconnect, currentSession } = useHelmet();
```

**Returns:**
```typescript
{
  isConnected: boolean;
  startScan: () => Promise<Device[]>;
  connectToHelmet: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  createNewSession: (session: Session) => void;
  currentSession: Session | null;
}
```

### `useToast()`

Toast notification management.

```typescript
const { toasts, show, dismiss, dismissAll } = useToast();
```

**Methods:**
- `show(title, message, type?, duration?)` - Show toast
- `dismiss(id)` - Remove specific toast
- `dismissAll()` - Clear all toasts

**Returns:**
```typescript
{
  toasts: Notification[];
  show: (title: string, message: string, type?: NotificationType, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
```

## State Management (Zustand)

### `useStore()`

Global app state.

```typescript
const { sessions, currentSession, isConnected, addSession, setConnected } = useStore();
```

**State:**
```typescript
{
  sessions: Session[]
  currentSession: Session | null
  isConnected: boolean
  isScanning: boolean
  userId: string | null
}
```

**Setters:**
```typescript
setSessions(sessions: Session[])
addSession(session: Session)
setCurrentSession(session: Session | null)
setConnected(connected: boolean)
setScanning(scanning: boolean)
setUserId(userId: string)
addImpactToSession(impact: Impact)
clearAll()
```

## Utilities

### Analytics (`utils/analytics.ts`)

#### `calculateSessionStats(session: Session): SessionStats`

Analyzes a single session.

```typescript
const stats = calculateSessionStats(session);
// Returns: {
//   totalImpacts: number,
//   maxGForce: number,
//   avgGForce: number,
//   maxRotational: number,
//   flaggedCount: number,
//   riskPercentage: number,
//   duration: number,
//   severity: 'low' | 'moderate' | 'high'
// }
```

#### `calculateTrendStats(sessions: Session[])`

Calculates trends across multiple sessions.

```typescript
const trends = calculateTrendStats(sessions);
// Returns: {
//   avgImpactsPerSession: number,
//   totalFlaggedImpacts: number,
//   highRiskSessions: number,
//   sessionCount: number
// }
```

#### `getTimeseriesData(session: Session): TimeseriesData[]`

Converts impacts to time-series format.

```typescript
const data = getTimeseriesData(session);
// Sorted by timestamp, ready for charting
```

#### `filterImpactsByRange(impacts, minG?, maxG?, flaggedOnly?)`

Filters impacts by criteria.

```typescript
const highImpacts = filterImpactsByRange(impacts, 60, 100);
const flagged = filterImpactsByRange(impacts, undefined, undefined, true);
```

#### `formatDuration(ms: number): string`

Human-readable duration.

```typescript
formatDuration(3661000) // "1h 1m"
```

### Validation (`utils/validation.ts`)

#### `validateImpact(impact: any): boolean`

Validates impact data structure and ranges.

```typescript
if (validateImpact(data)) {
  // data is Impact
}
```

#### `validateSession(session: any): boolean`

Validates session data.

#### `calculateConcussionRisk(impact: Impact)`

Assesses concussion risk.

```typescript
const { risk, reasons } = calculateConcussionRisk(impact);
// risk: 'low' | 'moderate' | 'high'
// reasons: string[] - Why flagged
```

#### `sanitizeImpact(impact: Partial<Impact>): Partial<Impact>`

Clamps values to valid ranges.

```typescript
const clean = sanitizeImpact({ gForce: 250 }); // Clamped to max 200
```

### Export (`utils/export.ts`)

#### `exportSession(session: Session, format: 'json' | 'csv'): string`

Exports session as formatted string.

```typescript
const json = exportSession(session, 'json');
const csv = exportSession(session, 'csv');
```

#### `generateFilename(session: Session, format: 'json' | 'csv'): string`

Creates standard filename.

```typescript
const name = generateFilename(session, 'json');
// "vela-session-2025-06-30-14-30-45.json"
```

### Notifications (`utils/notifications.ts`)

#### `notificationManager`

Persistent notification system.

```typescript
// Add notification
await notificationManager.addNotification({
  type: 'warning',
  title: 'High Impact',
  message: 'Impact detected',
});

// Get all
const notifications = await notificationManager.getNotifications();

// Mark as read
await notificationManager.markAsRead(id);

// Subscribe to updates
const unsubscribe = notificationManager.subscribe(notifications => {
  // React to changes
});
```

#### `notifyHighImpact(impact: Impact)`

Sends high impact alert.

```typescript
await notifyHighImpact(impact);
```

#### `notifyConnectionChange(connected: boolean)`

Sends connection status alert.

```typescript
await notifyConnectionChange(true); // Connected
```

### Logger (`utils/logger.ts`)

#### `logger.debug(tag, message, data?)`

Debug-level logging.

```typescript
logger.debug('BLE', 'Scanning started', { timeout: 10000 });
```

#### `logger.info(tag, message, data?)`

Info-level logging.

```typescript
logger.info('App', 'Session started');
```

#### `logger.warn(tag, message, data?)`

Warning-level logging.

```typescript
logger.warn('DB', 'Large dataset stored');
```

#### `logger.error(tag, message, error?)`

Error-level logging.

```typescript
logger.error('BLE', 'Connection failed', error);
```

### Testing (`utils/testing.ts`)

#### `createMockImpact(overrides?): Impact`

Creates test impact.

```typescript
const impact = createMockImpact({ gForce: 75 });
```

#### `createMockSession(overrides?): Session`

Creates test session.

```typescript
const session = createMockSession({ date: Date.now() });
```

#### `createHighRiskImpact(overrides?): Impact`

Creates flagged impact.

#### `createLowRiskImpact(overrides?): Impact`

Creates normal impact.

#### `createMockSessionWithMixedImpacts(): Session`

Creates realistic test data.

## Data Types

### Impact

```typescript
interface Impact {
  id: string;                    // Unique identifier
  timestamp: number;             // Milliseconds since epoch
  gForce: number;               // Gravitational force (0-200)
  rotational: number;           // Rotation rate (rad/s²)
  flagged: boolean;             // Exceeds safety threshold
}
```

### Session

```typescript
interface Session {
  id: string;                   // Unique session ID
  date: number;                 // Session start time (ms)
  impacts: Impact[];            // Array of impacts
}
```

### Notification

```typescript
interface Notification {
  id: string;
  type: 'impact' | 'connection' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}
```

## Error Handling

All async functions should use try-catch:

```typescript
try {
  await helmet.connect(device);
} catch (error) {
  logger.error('Connect', 'Failed to connect', error);
  // Show user-friendly error
}
```

## Performance Notes

- **BLE Scans**: 10 second duration, battery intensive
- **Storage**: AsyncStorage is sync on retrieval, use sparingly
- **State Updates**: Zustand batches updates automatically
- **Notifications**: Limited to 100 stored (oldest removed)

## Security

- Never log sensitive data
- Validate all external inputs
- Use AsyncStorage carefully (unencrypted)
- Supabase requires authentication in production
