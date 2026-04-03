import React, { useMemo, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import Wrapper from '../../../components/Wrapper';
import Text from '../../../components/Text';
import Icon from '../../../components/Icon';
import Button from '../../../components/Button';
import images from '../../../assets/images';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';
import { goBack, navigate } from '../../../utils/navigation';
import { ROUTES } from '../../../utils/routes';
import {
  getHealthPermissionState,
  openHealthSettings,
  requestPermissions,
  setWatchHealthLinked,
} from '../../../services/health/healthProvider';

const WatchConnect = () => {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const canOpenAppSettings = useMemo(() => Platform.OS === 'ios', []);

  const onPressConnect = async () => {
    setErrorText(null);
    setLoading(true);
    try {
      const state = await getHealthPermissionState();
      if (state.status === 'needs_install') {
        setErrorText(state.reason);
        openHealthSettings();
        return;
      }
      if (state.status !== 'ready') {
        setErrorText(state.reason || 'Health access is not available on this device.');
        return;
      }

      const granted = await requestPermissions();
      if (!granted) {
        setErrorText('Permission not granted. Please enable access in settings.');
        return;
      }

      await setWatchHealthLinked(true);
      navigate(ROUTES.WATCH_CONNECTED as any);
    } catch (e: any) {
      setErrorText(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onPressSettings = async () => {
    if (Platform.OS === 'android') {
      openHealthSettings();
      return;
    }
    if (canOpenAppSettings) {
      await Linking.openSettings();
    }
  };

  return (
    <Wrapper no_padding>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <Icon
              source={images.back}
              size={40}
              rounded
              less_rounded
              less_padding
              border={colors.white}
              onPress={goBack}
            />
          </View>
          <View style={styles.headerCenter}>
            <Text size={24} weight="semibold" position="center">
              Connect Watch
            </Text>
          </View>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.card}>
          <Text size={20} weight="semibold" position="center" line_height={26}>
            Sync your health and fitness data
          </Text>
          <Text
            size={14}
            weight="regular"
            color={colors.icon_gray}
            position="center"
            line_height={20}
            style={styles.permissionHint}
          >
            HealthKit / Health Connect permissions
          </Text>
          <Text
            size={13}
            weight="regular"
            color={colors.icon_gray}
            position="center"
            line_height={18}
            style={styles.helperLine}
          >
            Tap Connect to allow access on this device.
          </Text>

          <Button
            text="Connect"
            onPress={onPressConnect}
            loading={loading}
            style={styles.cta}
          />

          {!!errorText && (
            <View style={styles.errorWrap}>
              <Text size={13} color={colors.icon_gray} position="center" line_height={18}>
                {errorText}
              </Text>
              <Button
                text="Open Settings"
                type="outlined"
                onPress={onPressSettings}
                style={styles.settingsBtn}
              />
            </View>
          )}
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(50),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: heightPixel(20),
    width: '100%',
  },
  headerSide: {
    width: widthPixel(40),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(10),
    paddingHorizontal: widthPixel(18),
    paddingVertical: heightPixel(22),
    alignItems: 'center',
  },
  permissionHint: {
    marginTop: heightPixel(10),
    paddingHorizontal: widthPixel(4),
  },
  helperLine: {
    marginTop: heightPixel(8),
    paddingHorizontal: widthPixel(4),
  },
  cta: {
    marginTop: heightPixel(22),
    width: '100%',
    borderRadius: heightPixel(12),
  },
  errorWrap: {
    marginTop: heightPixel(14),
    width: '100%',
    gap: heightPixel(10),
  },
  settingsBtn: {
    width: '100%',
  },
});

export default WatchConnect;

