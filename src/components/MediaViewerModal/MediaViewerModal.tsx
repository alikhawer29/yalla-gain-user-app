import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Video from 'react-native-video';
import Image from '../Image';
import Icon from '../Icon';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const { width, height } = Dimensions.get('window');

interface IMediaViewerModal {
    visible: boolean;
    mediaUrl: string;
    isVideo: boolean;
    onClose: () => void;
}

export const MediaViewerModal: React.FC<IMediaViewerModal> = ({
    visible,
    mediaUrl,
    isVideo,
    onClose
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
            <View style={styles.container}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                >
                    <Icon
                        source={images.cross}
                        size={24}
                        tint_color={colors.white}
                    />
                </TouchableOpacity>

                {/* Media Content */}
                <View style={styles.mediaContainer} pointerEvents="box-none">
                    {isVideo ? (
                        <Video
                            source={{ uri: mediaUrl }}
                            style={styles.media}
                            resizeMode="contain"
                            controls
                            paused={false}
                        />
                    ) : (
                        <Image
                            source={{ uri: mediaUrl }}
                            resize="contain"
                            style={styles.media}
                        />
                    )}
                </View>

                {/* Tap anywhere to close hint */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    closeButton: {
        position: 'absolute',
        top: heightPixel(50),
        right: widthPixel(20),
        zIndex: 10,
        width: heightPixel(40),
        height: heightPixel(40),
        borderRadius: heightPixel(20),
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaContainer: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    media: {
        width: '100%',
        height: '100%',
    },
    playIconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    playIconBackground: {
        width: heightPixel(100),
        height: heightPixel(100),
        borderRadius: heightPixel(50),
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MediaViewerModal;

