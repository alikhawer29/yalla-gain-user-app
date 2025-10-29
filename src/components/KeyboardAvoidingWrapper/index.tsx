import React, { FC } from 'react';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { IKeyboardAvoidingWrapper } from '../../interfaces';
import styles from './styles';

const KeyboardAvoidingWrapper: FC<IKeyboardAvoidingWrapper> = ({ children }) => {
    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.content_container}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={Platform.OS === 'android' ? 150 : 80}
            enableAutomaticScroll={true}
            enableResetScrollToCoords={Platform.OS === 'ios'}
            keyboardOpeningTime={Platform.OS === 'ios' ? 250 : 0}
        >
            {children}
        </KeyboardAwareScrollView>
    )
}

export default KeyboardAvoidingWrapper;