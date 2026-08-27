import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { applyLockedOrientation, lockPortrait } from '../utils/screenOrientation';
import useLockedOrientation from './useLockedOrientation';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../utils/screenOrientation', () => ({
  applyLockedOrientation: jest.fn(),
  lockPortrait: jest.fn(),
}));

function Probe() {
  useLockedOrientation('landscape');
  return null;
}

describe('useLockedOrientation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('locks the requested orientation on focus and restores portrait on blur', () => {
    let cleanup: (() => void) | undefined;
    (useFocusEffect as jest.Mock).mockImplementation(callback => {
      cleanup = callback();
    });

    act(() => {
      renderer.create(<Probe />);
    });

    expect(applyLockedOrientation).toHaveBeenCalledWith('landscape');

    cleanup?.();

    expect(lockPortrait).toHaveBeenCalledTimes(1);
  });
});
