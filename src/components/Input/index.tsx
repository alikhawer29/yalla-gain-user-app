import React, { FC, memo, useEffect, useState } from 'react';
import { LayoutAnimation, TextInput, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import PhoneInput from "react-native-phone-number-input";
import fonts from '../../assets/fonts';
import images from '../../assets/images';
import useToggle from '../../hooks/useToggle';
import { IInput } from '../../interfaces';
import colors from '../../utils/colors';
import { createInsets, dateFormatter, heightPixel, timeFormatter, widthPixel } from '../../utils/helper';
import Icon from '../Icon';
import Text from '../Text';
import Touchable from '../Touchable';
import styles from './styles';

const Input: FC<IInput> = props => {

    const { label, placeholder, type, icon, error, value, onChangeText, onChangeCountry, maxLength, disabled, required = false, height, mode = "primary", country = "AE" } = props

    const [isPasswordVisible, setIsPasswordVisible] = useState(type === 'password');
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    useEffect(() => {
        if (error) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
    }, [error]);

    const getKeyboardProps = () => {
        switch (type) {
            case "email":
                return {
                    keyboardType: "email-address",
                    autoCapitalize: "none",
                };
            case "number":
                return { keyboardType: "numeric" };
            default:
                return { keyboardType: "default" };
        }
    };

    const keyboardProps = getKeyboardProps();

    let Component = (type === "date" || type === "time") ? Touchable : View

    const [toggleDate, dateOpen] = useToggle()

    return (
        <View style={styles.container}>
            {label && <Text size={16} weight="semibold" color={isFocused ? colors.white : colors.white} style={styles.label}>{label} {required && <Text size={12} weight="semibold" color={colors.danger} style={styles.label}>*</Text>}</Text>}
            {
                type === "phone" ?
                    <PhoneInput
                        layout='first'
                        disabled={disabled}
                        placeholder={placeholder}
                        defaultValue={value}
                        value={value}
                        defaultCode={country}
                        onChangeText={onChangeText}
                        onChangeCountry={onChangeCountry}
                        containerStyle={[{ padding: 0, backgroundColor: colors.transparent, gap: heightPixel(10), width: "100%" }]}
                        textInputStyle={[styles.input, { padding: 0, backgroundColor: colors.transparent, color: colors.white }]}
                        codeTextStyle={{ fontFamily: fonts.sfpro.regular, margin: 0, padding: 0, color: colors.white }}
                        flagButtonStyle={{ backgroundColor: colors.transparent, margin: 0 }}
                        textContainerStyle={{ paddingHorizontal: widthPixel(15), paddingVertical: 0, backgroundColor: colors.transparent, borderWidth: heightPixel(1), borderColor: colors.white, borderRadius: heightPixel(5) }}
                        countryPickerButtonStyle={{ borderWidth: heightPixel(1), borderColor: colors.white, borderRadius: heightPixel(5) }}
                        textInputProps={{
                            cursorColor: colors.primary,
                            placeholderTextColor: colors.white
                        }}
                        disableArrowIcon
                        countryPickerProps={{ renderFlagButton: false }}
                    />
                    :
                    <Component style={[styles.inputContainer, isFocused && mode !== "secondary" && styles.focusedInputContainer, type === "textarea" && styles.multiline_input_container, mode === "secondary" ? { borderColor: colors.transparent, backgroundColor: colors.grayish_black } : {}]} onPress={toggleDate} disabled={disabled}>
                        {
                            icon &&
                            <Icon source={icon} size={13.5} />
                        }
                        <TextInput
                            allowFontScaling={false}
                            style={[styles.input, type === "textarea" ? styles.multiline_input : {}, height ? { height: heightPixel(height) } : {}]}
                            placeholder={placeholder}
                            placeholderTextColor={colors.white}
                            secureTextEntry={isPasswordVisible}
                            selectionColor={colors.primary}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            value={type === "time" && value != "" ? timeFormatter(value) : value}
                            onChangeText={onChangeText}
                            maxLength={maxLength}
                            multiline={type === "textarea"}
                            textAlignVertical={type == "textarea" ? "top" : "center"}
                            editable={(type !== "date" && type !== "time") && !disabled}
                            {...keyboardProps}
                        />
                        {
                            (type === 'password' || type === 'date') && (
                                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.toggleIcon} disabled={type !== 'password'} hitSlop={createInsets(15)}>
                                    <Icon source={type === 'password' ? (!isPasswordVisible ? images.eye : images.eye_slash) : type === "date" ? images.calendar : null} size={18} tint_color={colors.white} />
                                </TouchableOpacity>
                            )
                        }
                    </Component>
            }
            {error && (
                <Text size={12} color={colors.danger} style={styles.error}>
                    {error}
                </Text>
            )}
            {
                (type === "date" || type === "time") &&
                <DatePicker
                    mode={type || 'date'}
                    modal
                    open={dateOpen}
                    date={value ? new Date(value) : new Date()}
                    onConfirm={(date) => {
                        toggleDate()
                        onChangeText(type === "time" ? date?.toISOString() : dateFormatter(date))
                    }}
                    onCancel={() => {
                        toggleDate()
                    }}
                />
            }
        </View >
    );
};

export default memo(Input);