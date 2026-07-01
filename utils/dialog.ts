// Cross-platform dialogs.
// React Native Web does not implement Alert.alert (it is a silent no-op in
// the browser), so every user-facing dialog must go through these helpers:
// native platforms get Alert.alert, web gets window.confirm / window.alert.

import { Alert, Platform } from 'react-native';

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'OK'
): void {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmText, onPress: onConfirm, style: 'destructive' },
  ]);
}

export function showNotice(title: string, message: string): void {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}
