import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import colors from '../../utils/colors';
import Text from '../Text';
import styles from './styles';
import { heightPixel } from '../../utils/helper';

const ITEM_ROW_HEIGHT = 48;

const Dropdown = props => {
  const {
    label,
    placeholder = 'Select',
    error,
    value,
    options = [],
    onChangeText,
    multiple = false,
    direction = 'AUTO',
    disabled = false,
    zIndex,
    zIndexInverse,
    height = 54,
    required = false,
    isLoading = false,
    textStyle = undefined,
    style = undefined,
    dropDownContainerStyle = undefined,
    arrowIconStyle = undefined,
    listMode = 'SCROLLVIEW',
    maxHeight,
    modalProps,
    open: openProp,
    setOpen: setOpenProp,
    flatListProps,
    scrollViewProps,
  } = props;

  useEffect(() => {
    if (error) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [error]);

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    typeof openProp === 'boolean' && typeof setOpenProp === 'function';
  const open = isControlled ? openProp : internalOpen;

  const openRef = useRef(open);
  openRef.current = open;
  const valueRef = useRef(value);
  valueRef.current = value;

  // DropDownPicker calls setOpen(true|false) or setOpen(prev => !prev)
  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const resolved =
        typeof next === 'function' ? next(openRef.current) : next;
      if (resolved === openRef.current) {
        return;
      }
      if (isControlled) {
        setOpenProp(resolved);
      } else {
        setInternalOpen(resolved);
      }
    },
    [isControlled, setOpenProp],
  );

  const resolvedMaxHeight =
    maxHeight ??
    heightPixel(
      Math.min(Math.max(options.length * ITEM_ROW_HEIGHT + 12, 120), 280),
    );

  /** Only notify parent when the user actually changes the value. */
  const applyValue = useCallback(
    (nextValue: any) => {
      if (nextValue === null || nextValue === undefined) {
        return;
      }
      // Loose equality so 1 and "1" don't thrash Formik / close the list
      if (nextValue == valueRef.current) {
        return;
      }
      onChangeText?.({ value: nextValue });
    },
    [onChangeText],
  );

  return (
    <View style={[styles.container, open ? styles.containerOpen : null]}>
      {label && (
        <Text
          size={16}
          weight="semibold"
          color={colors.white}
          style={styles.label}
        >
          {label}
          {required && (
            <Text
              size={12}
              weight="semibold"
              color={colors.danger}
              style={styles.label}
            >
              *
            </Text>
          )}
        </Text>
      )}
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        items={options}
        style={[styles.inputContainer, { height: heightPixel(height) }, style]}
        placeholder={placeholder}
        value={value ?? null}
        setValue={callback => {
          const current = valueRef.current ?? null;
          const next =
            typeof callback === 'function' ? callback(current) : callback;
          applyValue(next);
        }}
        onChangeValue={next => {
          applyValue(next);
        }}
        placeholderStyle={styles.placeholder}
        dropDownContainerStyle={[styles.dropdown, dropDownContainerStyle]}
        textStyle={[styles.text, textStyle].filter(Boolean)}
        listMode={listMode}
        maxHeight={resolvedMaxHeight}
        {...(modalProps ? { modalProps } : {})}
        flatListProps={{
          nestedScrollEnabled: true,
          showsVerticalScrollIndicator: true,
          keyboardShouldPersistTaps: 'handled',
          ...(flatListProps || {}),
        }}
        scrollViewProps={{
          nestedScrollEnabled: true,
          showsVerticalScrollIndicator: true,
          keyboardShouldPersistTaps: 'handled',
          ...(scrollViewProps || {}),
        }}
        multiple={multiple}
        mode="BADGE"
        dropDownDirection={direction}
        disabled={disabled}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
        labelProps={{ allowFontScaling: false }}
        itemProps={{ allowFontScaling: false }}
        arrowIconStyle={[
          { tintColor: colors.white },
          arrowIconStyle,
        ].filter(Boolean)}
        loading={isLoading}
      />
      {error ? (
        <Text size={12} color={colors.danger} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default memo(Dropdown);

export const getDropdownListHeight = (itemCount: number, cap = 320) =>
  heightPixel(Math.min(Math.max(itemCount * ITEM_ROW_HEIGHT + 16, 120), cap));
