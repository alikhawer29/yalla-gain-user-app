import React, { FC, memo, useEffect, useState } from 'react';
import { LayoutAnimation, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import PhoneInput from "react-native-phone-number-input";
import fonts from '../../assets/fonts';
import useToggle from '../../hooks/useToggle';
import { IInput } from '../../interfaces';
import colors from '../../utils/colors';
import { dateFormatter, timeFormatter } from '../../utils/helper';
import Icon from '../Icon';
import Text from '../Text';
import Touchable from '../Touchable';
import styles from './styles';
import images from '../../assets/images';

const Input: FC<IInput> = props => {

    const { label, placeholder, type, icon, error, value, onChangeText, maxLength, disabled, required = false } = props

    const [isPasswordVisible, setIsPasswordVisible] = useState(type === 'password');
    const [isFocused, setIsFocused] = useState(false);
    const [loaded, setLoaded] = useState(false)

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    useEffect(() => {
        if (error) {
            Vibration.vibrate(500);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
    }, [error]);

    useEffect(() => {
        if (type === "phone" && (value || value == null)) {
            const timeout = setTimeout(() => setLoaded(true), 80)
            return () => clearTimeout(timeout)
        }
    }, [type, value]);

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
            {label && <Text size={16} weight="semibold" color={isFocused ? colors.white : colors.white} style={styles.label}>{label} <Text size={12} weight="semibold" color={colors.danger} style={styles.label}>*</Text></Text>}
            {
                type === "phone" && (loaded || value === "") ?
                    <View style={styles.inputContainer}>
                        <PhoneInput
                            layout='first'
                            allowFontScaling={false}
                            disabled={disabled}
                            placeholder={placeholder}
                            defaultValue={value}
                            value={value}
                            defaultCode="US"
                            onChangeText={onChangeText}
                            containerStyle={[styles.input, { padding: 0 }]}
                            textInputStyle={[styles.input, { padding: 0 }]}
                            codeTextStyle={{ fontFamily: fonts.sfpro.regular, margin: 0, padding: 0 }}
                            flagButtonStyle={{ backgroundColor: colors.light_gray, margin: 0 }}
                            textContainerStyle={{ paddingHorizontal: 0, paddingVertical: 0 }}
                        />
                    </View> :
                    <Component style={[styles.inputContainer, isFocused && styles.focusedInputContainer, type === "textarea" && styles.multiline_input_container]} onPress={toggleDate} disabled={disabled}>
                        {
                            icon &&
                            <Icon source={icon} size={18} />
                        }
                        <TextInput
                            allowFontScaling={false}
                            style={[styles.input, type === "textarea" ? styles.multiline_input : {}]}
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
                                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.toggleIcon} disabled={type !== 'password'}>
                                    <Icon source={type === 'password' ? (!isPasswordVisible ? images.eye : images.eye_slash) : type === "date" ? images.calendar : null} size={18} tint_color={colors.white} />
                                </TouchableOpacity>
                            )
                        }
                    </Component>
            }
            {error && (
                <Text size={10} color={colors.danger} style={styles.error}>
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