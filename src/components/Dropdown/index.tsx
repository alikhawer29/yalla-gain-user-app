import React, { memo, useEffect } from 'react';
import { LayoutAnimation, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import colors from '../../utils/colors';
import Text from '../Text';
import styles from './styles';
import useToggle from '../../hooks/useToggle';
import { heightPixel } from '../../utils/helper';

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
  } = props;

  useEffect(() => {
    if (error) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [error]);

  const [toggle, open] = useToggle();

  const ITEM_ROW_HEIGHT = 48;
  const resolvedMaxHeight =
    maxHeight ??
    heightPixel(Math.min(Math.max(options.length * ITEM_ROW_HEIGHT + 12, 120), 360));

  return (
    <View style={styles.container}>
      {label && (
        <Text
          size={16}
          weight="semibold"
          color={colors.white}
          style={styles.label}
        >
          {label}
          {
            required &&
            <Text
              size={12}
              weight="semibold"
              color={colors.danger}
              style={styles.label}
            >
              *
            </Text>
          }
        </Text>
      )}
      <DropDownPicker
        open={open}
        setOpen={toggle}
        items={options}
        style={[styles.inputContainer, { height: heightPixel(height) }, style]}
        placeholder={placeholder}
        value={value}
        placeholderStyle={styles.placeholder}
        onSelectItem={onChangeText}
        dropDownContainerStyle={[styles.dropdown, dropDownContainerStyle]}
        textStyle={[styles.text, textStyle].filter(Boolean)}
        listMode={listMode}
        maxHeight={resolvedMaxHeight}
        {...(modalProps ? { modalProps } : {})}
        multiple={multiple}
        mode="BADGE"
        dropDownDirection={direction}
        disabled={disabled}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
        labelProps={{ allowFontScaling: false }}
        itemProps={{ allowFontScaling: false }}
        arrowIconStyle={[{ tintColor: colors.white }, arrowIconStyle].filter(Boolean)}
        loading={isLoading}
      />
      {error && (
        <Text size={12} color={colors.danger} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default memo(Dropdown);
