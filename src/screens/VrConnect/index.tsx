import React, { useCallback } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import images from '../../assets/images';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import { useModal } from '../../contexts/ModalContext';
import colors from '../../utils/colors';
import { LOREM } from '../../utils/data';
import styles from './styles';

const VrConnect = () => {
  const navigation = useNavigation();
  const { showOkModal } = useModal();

  const openDrawer = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onAccessVr = useCallback(() => {
    showOkModal({
      type: 'info',
      title: 'VR Instructions',
      message:
        'In order to use the VR Environment download the Yalla Gain app and required VR device.',
    });
  }, [showOkModal]);

  const VR_DESCRIPTION_1 =
    'Connect your VR device to unlock an immersive fitness and wellness experience inside the Yalla Gain virtual environment. Train, explore, and interact in a fully engaging 3D world designed to enhance your motivation and progress.';

  const VR_DESCRIPTION_2 =
    'To get started, make sure your VR headset is properly connected and the Yalla Gain VR application is installed on your device. Once connected, your account, avatar, and progress data will automatically sync with the VR experience.';

  const VR_DESCRIPTION_3 =
    'Enjoy interactive workouts, guided activities, and virtual coaching sessions in real time. Your personalized avatar and fitness journey will be reflected directly inside the VR environment for a more realistic and engaging experience.';

  return (
    <Wrapper no_padding>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <Icon
              source={images.drawer}
              size={40}
              rounded
              less_rounded
              less_padding
              border={colors.white}
              onPress={openDrawer}
            />
          </View>
          <View style={styles.headerCenter}>
            <Text size={24} weight="semibold" position="center">
              VR Connect
            </Text>
          </View>
          <View style={styles.headerSide} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Image
            source={images.vr_connect_hero}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.bodyText}>{VR_DESCRIPTION_1}</Text>
          <Text style={styles.bodyText}>{VR_DESCRIPTION_2}</Text>
          <Text style={styles.bodyText}>{VR_DESCRIPTION_3}</Text>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            text="Access VR"
            onPress={onAccessVr}
            style={styles.accessButton}
          />
        </View>
      </View>
    </Wrapper>
  );
};

export default VrConnect;
