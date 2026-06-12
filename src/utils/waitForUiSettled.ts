import { InteractionManager, Platform } from 'react-native';

/** Wait until RN modals/overlays finish dismissing before presenting native UI (e.g. Stripe). */
export function waitForUiSettled(extraDelayMs = 0): Promise<void> {
  return new Promise(resolve => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const baseDelay = Platform.OS === 'ios' ? 400 : 120;
          setTimeout(resolve, baseDelay + extraDelayMs);
        });
      });
    });
  });
}
