# Vela App - Preview Guide

## Quick Web Preview (Recommended)

The easiest way to see the app running is locally in your browser:

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd vela-app
```

### Step 2: Install & Run
```bash
npm install
npm start
```

### Step 3: Open in Browser
Press `w` when prompted, or manually open:
```
http://localhost:19006
```

## What You'll See

### Home Screen
- Real-time impact dashboard
- Session statistics (impacts, max G-force, avg G-force, risk)
- Impact distribution chart
- Session duration and severity level
- "Start New Session" button
- Recent impacts list with details

### Navigation (Bottom Menu)
- 🏠 Home - Current session overview
- 📊 History - Browse past sessions
- 📈 Analytics - Detailed statistics
- ⚠️ Alerts - High-risk impacts log

### History Screen
- List of all recorded sessions
- Date/time for each session
- Impact count and max G-force
- Flagged impact counter
- Tap to view session details

### Analytics Screen
- Complete session statistics
- Overall trend analysis
- Safety recommendations
- Risk assessment guidance

### Alerts Screen
- All flagged (high-risk) impacts
- Impact severity indicators
- Risk level classification
- Tap impacts for detailed view

### Alert Detail
- G-force measurement
- Rotational acceleration
- Risk level assessment
- Impact timestamp
- Medical recommendations
- Impact ID for reference

### Pairing Screen
- Search for Bluetooth helmets
- Device list with connection status
- Connection instructions
- (Note: Bluetooth won't work in web - it's for mobile/native)

### Account Screen
- User profile section
- Notification settings toggle
- Cloud sync toggle
- Data management options
- Clear all data (with confirmation)

## Features in Web Preview

### ✅ Fully Working
- All 6 screens and navigation
- Impact list and details
- Session history
- Analytics and statistics
- Settings management
- Data visualization with charts
- Toast notifications
- Loading states
- Mock data generation

### ❌ Not in Web Preview
- Bluetooth connectivity (mobile-only)
- Actual helmet sensor data
- Push notifications (mobile-only)
- Camera/permission dialogs

## Interactive Features

### Try These Actions

1. **Start New Session**
   - Click "Start New Session" on home
   - View new impacts added
   - Watch statistics update

2. **Browse History**
   - Go to History tab
   - See all past sessions
   - Click a session to see impacts

3. **Check Analytics**
   - Go to Analytics tab
   - View detailed statistics
   - See trend analysis

4. **View Alerts**
   - Go to Alerts tab
   - See flagged impacts (high-risk)
   - Click impact for details

5. **Configure Settings**
   - Go to Account tab
   - Toggle notifications
   - Toggle cloud sync
   - View app version

6. **Impact Details**
   - Click any impact card
   - See full impact data
   - View risk assessment
   - Read medical recommendations

## Test Data

The app comes with realistic mock data:
- **G-Force Range**: 20-100G (realistic impact data)
- **Rotational**: 1000-6000 rad/s²
- **Risk Flagging**: ~30% of impacts flagged as high-risk
- **Sessions**: 5-14 impacts per session

You can generate new data by:
1. Clicking "Start New Session" on home
2. Viewing the new session with fresh impacts

## Browser Compatibility

### Fully Supported
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Not Supported
- Internet Explorer (no web support)
- Very old browser versions

## Tips for Best Experience

1. **Use Desktop Browser**
   - Larger screen for better UX
   - Easier to navigate

2. **Recommended Window Size**
   - 1024px width or wider
   - Simulates phone viewport well

3. **Chrome DevTools**
   - Press F12 for dev tools
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test mobile view

4. **Dark Theme**
   - App uses light theme by default
   - Can add dark mode testing in future

## Performance

The web preview runs at full speed:
- ✅ Fast navigation between screens
- ✅ Smooth animations and transitions
- ✅ Real-time data updates
- ✅ Responsive layout

## Troubleshooting

### App won't start
```bash
# Clear cache and restart
npm start -- --clear
```

### Port already in use
```bash
# Use different port
expo start --web --port 3000
```

### Dependencies issue
```bash
# Reinstall with legacy peer deps
rm -rf node_modules
npm install --legacy-peer-deps
```

## Mobile Preview

### On Your Phone (iOS/Android)

#### Using Expo Go App
1. Download "Expo Go" from App Store / Play Store
2. Run: `npm start`
3. Scan QR code with Expo Go
4. View on your phone

#### On Emulator
```bash
# iOS (macOS only)
npm run ios

# Android
npm run android
```

## Video Walkthrough

To capture video of the app:

### Web Preview
1. Press `w` to open web
2. Use Chrome DevTools device emulation (Ctrl+Shift+M)
3. Record with browser tools or screen capture

### Mobile Preview
1. Run on phone or emulator
2. Use screen recording feature
3. Share the recording

## Questions?

### About the Code
- See `ARCHITECTURE.md` for system design
- See `API.md` for all services and utilities
- See individual files for inline documentation

### About Features
- Check `README.md` for feature overview
- See `PROJECT_SUMMARY.md` for complete details

### About Development
- See `DEVELOPMENT.md` for dev workflow
- See `DEPLOYMENT.md` for production builds

## Next Steps

After previewing:

1. **Review the Code**
   - Start with main screens in `/app`
   - Check services in `/services`
   - Explore utilities in `/utils`

2. **Understand the Architecture**
   - Read `ARCHITECTURE.md`
   - Study the data flow
   - Review component hierarchy

3. **Try Building**
   - Build for iOS: `npm run ios`
   - Build for Android: `npm run android`
   - Export for web: `npm run web`

4. **Extend the App**
   - Add custom features
   - Modify thresholds in `config/constants.ts`
   - Create new screens following the pattern

---

**Enjoy exploring Vela! 🎉**
