export type LockedOrientation = 'portrait' | 'landscape';

type OrientationApi = {
  lockToPortrait: () => void;
  lockToLandscape: (direction: string) => void;
  LandscapeDirection: { RIGHT: string };
};

function getOrientationApi(): OrientationApi {
  // Delayed load: TurboModuleRegistry.getEnforcing('OrientationTurbo') runs on
  // import and NPEs while the RN 0.82 runtime is still starting.
  return require('react-native-orientation-turbo');
}

export function lockPortrait() {
  try {
    getOrientationApi().lockToPortrait();
  } catch {
    return;
  }
}

export function lockLandscape() {
  try {
    const api = getOrientationApi();
    api.lockToLandscape(api.LandscapeDirection.RIGHT);
  } catch {
    return;
  }
}

export function applyLockedOrientation(orientation: LockedOrientation) {
  switch (orientation) {
    case 'landscape':
      lockLandscape();
      return;
    case 'portrait':
      lockPortrait();
      return;
    default: {
      const exhaustive: never = orientation;
      return exhaustive;
    }
  }
}
