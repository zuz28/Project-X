# Vela App - Development Notes

## OPEN TODOs (check these first in every session)

1. **Finish real email via EmailJS** — the code integration is DONE
   (`services/email.ts` supports EmailJS / custom backend / demo fallback,
   selected via env vars documented in `.env.example`). What remains is the
   user-side setup: Zac needs to create a free EmailJS account, add a
   service + template, and paste the three IDs into `.env`. Until then the
   app runs in demo mode (verification code shown on screen). When Zac asks
   to "finish email", walk him through the EmailJS steps in `.env.example`.
2. **Figma design file** — a Figma MCP connector exists but disconnected
   before the file could be created. When it's connected, build the Vela
   design file (dark Whoop-style tokens + Login/Home/Analytics/Insights
   frames) in his drafts (plan key: team::1654368220166342963).
3. **Real BLE** — helmet connection is still simulated (`services/ble.ts`);
   needs react-native-ble-plx + the real helmet's protocol spec.
4. **Cloud backend** — accounts/sessions are on-device only (AsyncStorage);
   Firebase or Supabase planned for sync/recovery.

Current design language: Whoop-style dark theme — near-black layered
surfaces, white text, blue (#4A9EFF) accents only, Ionicons, uppercase
tracked labels, ScoreRing on Home, SessionBarChart in Analytics. Tokens
live in `styles/theme.ts`. The "Apple light theme" descriptions below are
historical.

## Project Overview

Vela is a beautiful Apple-designed mobile app for real-time impact tracking in sports and athletic activities. Built with React Native/Expo, featuring BLE helmet integration, real-time analytics, and personalized health insights.

## Architecture

### Navigation Structure
- **Root Layout** (`app/_layout.tsx`): Stack navigator with global impact alert layer
- **Tab Navigation** (`app/(tabs)/_layout.tsx`): 4-tab interface (Home, History, Analytics, Alerts)
- **Dynamic Routes**: 
  - `/impact/[id]` - Individual impact details
  - `/session/[id]` - Session analysis
  - `/connect` - Device pairing
  - `/settings` - App preferences
  - `/insights` - Health recommendations
  - `/onboarding` - First-time user flow

### State Management
- **Zustand Store** (`store/index.ts`): Global app state
  - Sessions array (history)
  - Current session (active tracking)
  - Connection status (BLE device)
  - Device name tracking
  - Impact actions

### Services
- **BLE Service** (`services/ble.ts`): Bluetooth connectivity
  - Device discovery/scanning
  - Connection management
  - Real-time impact streaming
  - Mock data simulation
  
- **Storage Service** (`services/storage.ts`): Local data persistence
  - AsyncStorage integration
  - Session CRUD operations
  - Error handling

- **Export Service** (`services/export.ts`): Data export
  - CSV generation
  - Report generation
  - Medical recommendations

- **Mock Data** (`services/mockData.ts`): Development data
  - Impact generation (20-90G range)
  - Session generation
  - Realistic distributions

### Components
- **ImpactAlert**: Real-time notification with animations
- **LoadingScreen**: Animated loading indicator
- **EmptyState**: Consistent empty state UI
- **Button**: Reusable button with variants
- **Card**: Container component

### Design System
- **Colors**: Apple blue primary with complementary palette
- **Typography**: 11pt-40pt system fonts
- **Spacing**: 4px-40px modular scale
- **Radius**: 6px-20px rounded corners
- **Shadows**: 3 levels (sm, md, lg)
- **Animation**: 150ms-800ms durations

## Feature Breakdown

### Home Screen (`app/(tabs)/index.tsx`)
- Connection status badge
- 4 stats cards (Impacts, Max G, Avg G, Flagged)
- Action buttons (Connect, New Session, Insights)
- Recent impacts list (last 5)
- Settings access

### History Screen (`app/(tabs)/history.tsx`)
- All sessions chronological list
- Per-session summary (impacts, max G, flagged)
- Tap to view full session details

### Analytics Screen (`app/(tabs)/analytics.tsx`)
- All-time statistics
- G-force analysis (avg, max, min)
- Per-session averages
- Current session status

### Alerts Screen (`app/(tabs)/alerts.tsx`)
- Chronological flagged impacts
- Per-impact detail view
- Rotational force display

### Impact Detail (`app/impact/[id].tsx`)
- Large G-force display with severity color
- Timestamp and session reference
- Linear & rotational measurements
- Risk analysis (Critical/High/Normal)
- Health recommendations

### Session Detail (`app/session/[id].tsx`)
- Summary stats grid
- Top 5 impacts ranking
- Session analysis metrics
- Risk assessment with guidance

### Device Connection (`app/connect.tsx`)
- Step-by-step instructions
- Available device list
- Signal strength indicators
- Connection state feedback

### Settings (`app/settings.tsx`)
- Device management
- Notification toggles
- Impact threshold configuration
- Data export
- Data clearing (with confirmation)
- App version info

### Health Insights (`app/insights.tsx`)
- Health score (0-100)
- Risk summary grid
- Smart recommendations
- Safety tips
- Cumulative impact tracking

### Onboarding (`app/onboarding.tsx`)
- Welcome hero section
- Feature highlights
- How-it-works steps
- Get started CTA

## Development Guidelines

### Adding New Screens
1. Create file in `app/` or `app/(tabs)/`
2. Export default component
3. Add to `app/_layout.tsx` Stack
4. Use theme tokens from `styles/theme.ts`
5. Follow naming: kebab-case filenames, PascalCase components

### Working with State
```typescript
const { sessions, currentSession, isConnected } = useStore();
// Mutations via actions
setCurrentSession(session);
setConnected(true);
addImpact(impactData);
```

### BLE Integration
```typescript
// Listen for impacts
const unsubscribe = bleService.onImpact((data) => {
  // Handle impact
});
```

### Styling Pattern
```typescript
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
  },
  // Use theme tokens consistently
});
```

## Performance Considerations

- FlatList for large lists (impact lists, session history)
- Animated.Value for smooth transitions
- useNativeDriver: true for performance
- Memoization for expensive calculations
- Lazy loading for session details

## Testing Checklist

- [ ] Connect/disconnect flow works
- [ ] Real-time impacts appear and animate
- [ ] Session creation/loading
- [ ] Impact detail navigation
- [ ] Analytics calculations correct
- [ ] Export generates valid CSV
- [ ] Settings persist
- [ ] Animations smooth on target devices
- [ ] Empty states display correctly
- [ ] Error handling graceful

## Known Limitations

- Mock BLE data (real helmet integration needed)
- No cloud sync (local storage only)
- No multi-user support
- Android-only for now (iOS coming)

## Future Enhancements

1. **Cloud Integration**
   - Sync sessions across devices
   - Cloud backup
   - Multi-device pairing

2. **Advanced Analytics**
   - Charts/graphs
   - Trend prediction
   - Activity correlation

3. **Social Features**
   - Team dashboards
   - Coach review
   - Leaderboards

4. **Hardware**
   - Real BLE implementation
   - Helmet firmware updates
   - Multiple sensor support

5. **Medical Integration**
   - Doctor sharing
   - EHR export
   - Concussion protocol

## Deployment

### Prerequisites
- Expo account
- Apple Developer account (iOS)
- Google Play account (Android)

### Build Process
```bash
# Prebuild native code
expo prebuild

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Support Resources

- Expo Docs: https://docs.expo.dev
- React Native Docs: https://reactnative.dev
- BLE Library: https://react-native-ble-plx.documentation
- Design System: Apple HIG

## Contributors

- Claude (Full-stack development)

## License

Proprietary - All rights reserved
