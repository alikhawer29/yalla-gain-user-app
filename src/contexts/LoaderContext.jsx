import React, { createContext, useContext, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import colors from '../Utils/colors';
import { heightPixel } from '../Utils/helper';

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {

    const [loading, setLoading] = useState(false);

    const handleLoader = (value) => setLoading(value || false);

    return (
        <LoaderContext.Provider value={{ handleLoader }}>
            {children}
            <Modal transparent visible={loading} animationType="fade" statusBarTranslucent>
                <View style={styles.modalBackground}>
                    <View style={styles.loaderContainer}>
                        <LoaderKit
                            style={{ width: heightPixel(50), height: heightPixel(50) }}
                            name={'BallSpinFadeLoader'}
                            color={colors.primary}
                        />
                    </View>
                </View>
            </Modal>
        </LoaderContext.Provider>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    loaderContainer: {
        width: heightPixel(120),
        height: heightPixel(120),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: heightPixel(10),
    },
});