import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  applyLockedOrientation,
  lockPortrait,
  type LockedOrientation,
} from '../utils/screenOrientation';

const useLockedOrientation = (orientation: LockedOrientation) => {
  useFocusEffect(
    useCallback(() => {
      applyLockedOrientation(orientation);
      return () => {
        lockPortrait();
      };
    }, [orientation]),
  );
};

export default useLockedOrientation;
