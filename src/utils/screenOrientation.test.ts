import { LandscapeDirection, lockToLandscape, lockToPortrait } from 'react-native-orientation-turbo';
import { applyLockedOrientation, lockLandscape, lockPortrait } from './screenOrientation';

jest.mock(
  'react-native-orientation-turbo',
  () => ({
    lockToPortrait: jest.fn(),
    lockToLandscape: jest.fn(),
    LandscapeDirection: {
      LEFT: 'LEFT',
      RIGHT: 'RIGHT',
    },
  }),
  { virtual: true },
);

describe('lockLandscape', () => {
  it('locks the device to landscape', () => {
    lockLandscape();

    expect(lockToLandscape).toHaveBeenCalledWith(LandscapeDirection.RIGHT);
  });
});

describe('lockPortrait', () => {
  it('locks the device to portrait', () => {
    lockPortrait();

    expect(lockToPortrait).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the native module is not ready', () => {
    (lockToPortrait as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Exception in HostFunction: java.lang.NullPointerException');
    });

    expect(() => lockPortrait()).not.toThrow();
  });
});

describe('applyLockedOrientation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('locks landscape when the player needs a horizontal video', () => {
    applyLockedOrientation('landscape');

    expect(lockToLandscape).toHaveBeenCalledWith(LandscapeDirection.RIGHT);
    expect(lockToPortrait).not.toHaveBeenCalled();
  });

  it('locks portrait for the rest of the app', () => {
    applyLockedOrientation('portrait');

    expect(lockToPortrait).toHaveBeenCalledTimes(1);
    expect(lockToLandscape).not.toHaveBeenCalled();
  });
});
