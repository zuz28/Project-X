# Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] TypeScript strict mode enabled, no errors
- [ ] All dependencies up to date
- [ ] No hardcoded secrets or API keys
- [ ] Code reviewed

### Configuration
- [ ] Environment variables configured
- [ ] App version updated (app.json, package.json)
- [ ] Build number incremented
- [ ] App icon and splash screen finalized
- [ ] Bundle ID correct
- [ ] App name finalized

### Features & Testing
- [ ] All features working on iOS and Android
- [ ] Bluetooth functionality tested with hardware
- [ ] Local storage working correctly
- [ ] Cloud sync tested (if enabled)
- [ ] Notifications tested
- [ ] Offline mode tested
- [ ] Performance optimized

### Documentation
- [ ] README updated
- [ ] API docs current
- [ ] CHANGELOG updated
- [ ] Known issues documented

## Building for iOS

### Prerequisites

- macOS with Xcode
- Apple Developer account
- Provisioning profiles configured
- App ID created in Apple Developer portal

### Build Steps

#### 1. Prepare the build

```bash
# Update dependencies
npm install

# Prebuild for iOS
expo prebuild --platform ios
```

#### 2. Configure signing

```bash
# Set signing identities in Xcode
# Or use provisioning profiles configured in app.json
```

#### 3. Build the app

```bash
# Using Expo (recommended)
eas build --platform ios

# Or build locally
cd ios
xcodebuild -workspace Vela.xcworkspace -scheme Vela -configuration Release -archivePath Vela.xcarchive archive
xcodebuild -exportArchive -archivePath Vela.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath .
```

#### 4. Submit to App Store

```bash
# Using Xcode
# Product > Archive > Validate App > Upload to App Store

# Or using transporter
xcrun altool --upload-app -f Vela.ipa -u <apple_id> -p <app_specific_password>
```

## Building for Android

### Prerequisites

- Android SDK
- Android NDK
- Java Development Kit (JDK)
- Keystore file for signing
- Google Play Developer account

### Build Steps

#### 1. Create or prepare keystore

```bash
# Create new keystore (first time only)
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias vela-key

# Store securely, update app.json with path
```

#### 2. Configure signing in app.json

```json
{
  "expo": {
    "android": {
      "config": {
        "googleServicesFile": "./google-services.json"
      }
    }
  }
}
```

#### 3. Build APK or AAB

```bash
# Using Expo (recommended)
eas build --platform android

# Or build locally
cd android
./gradlew bundleRelease  # Creates App Bundle
# or
./gradlew assembleRelease  # Creates APK
```

#### 4. Upload to Google Play

```bash
# Using Play Console web interface
# - Go to Google Play Console
# - Create release
# - Upload AAB or APK
# - Set release notes
# - Configure rollout percentage
# - Submit for review

# Or use bundletool for testing
bundletool build-apks \
  --bundle=app.aab \
  --output=app.apks \
  --ks=release.keystore
```

## Environment Configuration

### .env.production

```bash
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-key

# Feature flags
EXPO_PUBLIC_ENABLE_CLOUD_SYNC=true
EXPO_PUBLIC_ENABLE_NOTIFICATIONS=true

# Analytics (if added)
EXPO_PUBLIC_ANALYTICS_KEY=your-key
```

### Secrets Management

Never commit secrets. Use environment-specific files:

```
.env              # Defaults
.env.local        # Local overrides (gitignored)
.env.production   # Production config
.env.staging      # Staging config
```

## Version Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH
1.0.0

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes
```

### Update version

```json
{
  "version": "1.0.0",
  "expo": {
    "version": "1.0.0"
  }
}
```

### Build number

```json
{
  "expo": {
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

## Release Notes Template

```markdown
## Version 1.0.0 - Release Date

### New Features
- Impact tracking with real-time Bluetooth
- Session management and history
- Risk assessment and alerts

### Improvements
- Better BLE connection stability
- Improved performance

### Bug Fixes
- Fixed issue with data persistence
- Resolved connection timeout errors

### Known Issues
- None

### Installation
Update from App Store or Google Play Store
```

## Post-Deployment

### Monitoring

- Monitor crash reports
- Check user reviews
- Track analytics data
- Monitor cloud sync status

### Rollback Plan

1. **Critical issues**: Immediately pull from stores
2. **Important issues**: Release patch version within 24 hours
3. **Minor issues**: Schedule for next release

### Communication

- Notify users of issues
- Provide status updates
- Publish postmortems if needed

## Continuous Deployment Setup

### GitHub Actions Example

```yaml
name: Deploy to App Store

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: eas build --platform ios --wait
      - run: eas submit --platform ios
```

## Performance Optimization

### Before Release

1. Profile app performance
   ```bash
   # Use React DevTools Profiler
   npm install -g react-devtools
   react-devtools
   ```

2. Check bundle size
   ```bash
   # Analyze bundle
   npm run build -- --analyze
   ```

3. Test on low-end devices
   - Older phone model
   - Slow network (throttled)
   - Low memory scenarios

### Optimization Checklist

- [ ] No unnecessary re-renders
- [ ] Lazy load screens/components
- [ ] Compress images
- [ ] Tree-shake unused code
- [ ] Minify production code

## Security Checklist

### Before Release

- [ ] No hardcoded credentials
- [ ] HTTPS for all API calls
- [ ] Input validation on all forms
- [ ] No sensitive data in logs
- [ ] Secure storage for tokens
- [ ] Rate limiting enabled
- [ ] Error messages don't leak info

### Ongoing

- [ ] Monitor for vulnerabilities
- [ ] Update dependencies regularly
- [ ] Security audits quarterly
- [ ] Penetration testing before major releases

## Analytics & Monitoring

### Setup

1. **Crash Reporting**: Integrate Sentry or similar
2. **Analytics**: Track user flows and crashes
3. **Performance**: Monitor app startup time, frame rate

### Example: Sentry Setup

```typescript
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableInExpoDevelopment: true,
  tracesSampleRate: 1.0,
});
```

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules .expo
npm install
expo start --clear

# Check logs
eas build --platform ios --status
```

### App Crashes on Startup

1. Check logs: `adb logcat` (Android) or Xcode (iOS)
2. Verify permissions are granted
3. Check environment variables are set
4. Test with mock data

### Bluetooth Not Working

1. Verify BLE UUIDs are correct
2. Check permissions in app.json
3. Test on actual device
4. Check helmet firmware is compatible

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)
- [Apple Developer Program](https://developer.apple.com/)
- [Google Play Developer Program](https://play.google.com/apps/publish/)

## Support & Contact

For deployment issues, contact the development team or check:
- GitHub Issues
- Documentation Wiki
- Team Slack channel
