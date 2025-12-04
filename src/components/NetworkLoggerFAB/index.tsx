import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import Icon from '../Icon';

const NetworkLoggerFAB = () => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setVisible(true)}
                activeOpacity={0.8}
            >
                <Icon source={images.drawer_icons.help_center} size={24} tint_color={colors.white} />
            </TouchableOpacity>

            {/* Network Logger Modal */}
            <Modal
                visible={visible}
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.close_btn}
                            onPress={() => setVisible(false)}
                        >
                            <Icon source={images.cross} size={24} tint_color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    <NetworkLogger theme="dark" />
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: heightPixel(100),
        right: widthPixel(20),
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 9999,
    },
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        paddingTop: heightPixel(50),
        paddingHorizontal: widthPixel(15),
        paddingBottom: heightPixel(10),
        backgroundColor: '#1a1a2e',
        alignItems: 'flex-end',
    },
    close_btn: {
        padding: 8,
    },
});

export default NetworkLoggerFAB;

