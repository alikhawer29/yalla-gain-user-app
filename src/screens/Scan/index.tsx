import { useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import images from '../../assets/images';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import NoPermission from '../../components/NoPermission';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Touchable from '../../components/Touchable';
import { useModal } from '../../contexts/ModalContext';
import { useAppSelector } from '../../hooks';
import usePermissions from '../../hooks/usePermissions';
import {
  useGetBodygramScanTokenMutation,
  useScanAvatarMutation,
} from '../../redux/Apis/User';
import { selectUser } from '../../redux/Slices/AuthSlice';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import { goBack, navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';

const friendlyBodygramError = (code?: string) => {
  switch (code) {
    case 'personNotDetected':
      return 'We could not detect a person in the photos. Stand fully in frame and try again.';
    case 'rightPhotoFacingWrongDirection':
      return 'The side photo facing looks incorrect. Please retake the scan.';
    default:
      return code
        ? `Scan failed (${code}). Please try again.`
        : 'Bodygram scan failed. Please try again.';
  }
};

type FacingMode = 'environment' | 'user';

const BODYGRAM_BRIDGE_SCRIPT = `
(function () {
  window.BGScanflowJSWebviewInterface = function (fnName, args) {
    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ fnName: fnName, args: args })
      );
    } catch (e) {}
  };
  true;
})();
`;

/**
 * Bodygram how-to-scan is authored for a light page. Dark app WebViews
 * (esp. Android algorithmic darkening) invert the canvas and leave copy unreadable.
 * Force light color-scheme only — do not blanket-override text colors (scan UI needs them).
 */
const BODYGRAM_LIGHT_THEME_SCRIPT = `
(function () {
  try {
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'color-scheme');
      (document.head || document.documentElement).appendChild(meta);
    }
    meta.setAttribute('content', 'only light');

    var root = document.documentElement;
    root.style.setProperty('color-scheme', 'only light');
    if (document.body) {
      document.body.style.setProperty('color-scheme', 'only light');
      document.body.style.backgroundColor = '#ffffff';
    }

    if (!document.getElementById('yg-bodygram-light-theme')) {
      var style = document.createElement('style');
      style.id = 'yg-bodygram-light-theme';
      style.textContent = [
        'html { color-scheme: only light !important; }',
        'body { color-scheme: only light !important; background-color: #ffffff !important; }',
        '@media (prefers-color-scheme: dark) {',
        '  html, body { color-scheme: only light !important; background-color: #ffffff !important; }',
        '}',
      ].join('\\n');
      (document.head || document.documentElement).appendChild(style);
    }
  } catch (e) {}
  true;
})();
`;

const BODYGRAM_INJECTED_SCRIPT = `
${BODYGRAM_BRIDGE_SCRIPT}
${BODYGRAM_LIGHT_THEME_SCRIPT}
`;

type ScanToken = {
  token: string;
  orgId: string;
};

const Scan = () => {
  const route = useRoute();
  const { formData } = (route.params as any) || {};
  const user = useAppSelector(selectUser);
  const { showOkModal, showYesNoModal } = useModal();
  const webViewRef = useRef<WebView>(null);
  const submittingRef = useRef(false);

  const [submitScan, { isLoading: isSubmitting }] = useScanAvatarMutation();
  const [fetchToken, { isLoading: isFetchingToken }] =
    useGetBodygramScanTokenMutation();

  const [granted, setGranted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [scanToken, setScanToken] = useState<ScanToken | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [webViewKey, setWebViewKey] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const { ensurePermissions, PERMISSIONS } = usePermissions();

  useEffect(() => {
    const ask = async () => {
      const required =
        Platform.select({
          ios: [PERMISSIONS.IOS.CAMERA],
          android: [PERMISSIONS.ANDROID.CAMERA],
        }) || [];
      const hasAccess = await ensurePermissions(required);
      setChecking(false);
      setGranted(hasAccess);
    };
    setTimeout(() => {
      ask();
    }, 500);
  }, [ensurePermissions, PERMISSIONS]);

  const loadToken = useCallback(async () => {
    if (!user?.id) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'User not found. Please sign in again.',
      });
      return;
    }
    try {
      setScanError(null);
      setIsProcessing(false);
      submittingRef.current = false;
      const res = await fetchToken({ user_id: user.id }).unwrap();
      const token = res?.token ?? res?.data?.token;
      const orgId = res?.org_id ?? res?.data?.org_id;
      if (!token || !orgId) {
        throw new Error('Invalid scan token response');
      }
      setScanToken({ token, orgId });
      setWebViewKey(k => k + 1);
    } catch (error: any) {
      setScanToken(null);
      setScanError(
        error?.data?.message ||
          error?.message ||
          'Failed to start Bodygram scanner. Please try again.',
      );
    }
  }, [user?.id, fetchToken, showOkModal]);

  const restartScanner = useCallback(() => {
    setScanError(null);
    setIsProcessing(false);
    submittingRef.current = false;
    setScanToken(null);
    loadToken();
  }, [loadToken]);

  const handleScanFailure = useCallback(
    (message: string) => {
      setIsProcessing(false);
      submittingRef.current = false;
      // Unmount WebView so the user is not stuck on Bodygram's error page.
      setScanToken(null);
      setScanError(message);
      showYesNoModal(
        {
          type: 'error',
          title: 'Scan Failed',
          message,
          yesText: 'Retry',
          noText: 'Go Back',
        },
        () => {
          restartScanner();
        },
        () => {
          goBack();
        },
      );
    },
    [showYesNoModal, restartScanner],
  );

  useEffect(() => {
    if (!granted || !formData || !user?.id) return;
    loadToken();
    // Intentionally once when camera is granted and form is present.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granted, user?.id]);

  const scannerUrl = useMemo(() => {
    if (!scanToken || !formData) return null;

    const query: Record<string, string> = {
      token: scanToken.token,
      system: 'metric',
      height: String(formData.height),
      weight: String(formData.weight),
      age: String(formData.age),
      gender: String(formData.gender),
      screens: 'how-to-scan,scan',
      tap: 'true',
      'remove-header': 'true',
      'camera-constraints': JSON.stringify({ facingMode }),
    };
    if (facingMode === 'environment') {
      query['no-mirror'] = 'true';
    }

    const qs = Object.entries(query)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');

    return `https://platform.bodygram.com/en/${scanToken.orgId}/scan?${qs}`;
  }, [scanToken, formData, facingMode]);

  const submitBodygramScan = useCallback(
    async (bodygramScanId: string) => {
      if (submittingRef.current || !formData || !user?.id) return;
      submittingRef.current = true;
      try {
        const submitFormData = new FormData();
        submitFormData.append('user_id', String(user.id));
        submitFormData.append('age', String(formData.age));
        submitFormData.append('gender', formData.gender);
        submitFormData.append('height', String(formData.height));
        submitFormData.append('weight', String(formData.weight));
        submitFormData.append('scan', 'true');
        submitFormData.append('bodygram_scan_id', bodygramScanId);

        await submitScan(submitFormData).unwrap();
        navigate(ROUTES.CREATE_AVATAR);
      } catch (error: any) {
        handleScanFailure(
          error?.data?.message ||
            'Failed to submit scan data. Please try again.',
        );
      }
    },
    [formData, user?.id, submitScan, handleScanFailure],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event?.nativeEvent?.data || '{}');
        const fnName = data?.fnName as string | undefined;
        let args = data?.args;

        if (typeof args === 'string') {
          try {
            args = JSON.parse(args);
          } catch {
            // keep string
          }
        }

        switch (fnName) {
          case 'onRequestClose':
            goBack();
            break;
          case 'onStartProcessingScannedImages':
            setIsProcessing(true);
            break;
          case 'onModelLoadStatusChange':
            break;
          case 'onSuccess': {
            const scanId = args?.id;
            if (!scanId) {
              handleScanFailure('Scan completed but no scan id was returned.');
              return;
            }
            setIsProcessing(true);
            submitBodygramScan(String(scanId));
            break;
          }
          case 'onError': {
            const code = args?.entry?.error?.code || args?.error?.code;
            handleScanFailure(friendlyBodygramError(code));
            break;
          }
          default:
            break;
        }
      } catch {
        // Ignore non-JSON / unexpected messages
      }
    },
    [handleScanFailure, submitBodygramScan],
  );

  const onFlipCamera = useCallback(() => {
    if (isProcessing || isSubmitting || scanError) return;
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    setWebViewKey(k => k + 1);
  }, [isProcessing, isSubmitting, scanError]);

  if (checking) return null;

  if (!granted) {
    return <NoPermission message={'Camera Permission is required'} />;
  }

  if (!formData) {
    return (
      <View style={styles.centered}>
        <Text color={colors.white} weight="bold" size={16}>
          Missing scan form data.
        </Text>
        <Button text="Go Back" onPress={goBack} style={styles.backBtn} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {scannerUrl && !scanError ? (
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ uri: scannerUrl }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
          originWhitelist={['*']}
          allowsFullscreenVideo
          setSupportMultipleWindows={false}
          forceDarkOn={false}
          onMessage={onMessage}
          injectedJavaScriptBeforeContentLoaded={BODYGRAM_INJECTED_SCRIPT}
          injectedJavaScript={BODYGRAM_INJECTED_SCRIPT}
          onLoadStart={() => {
            webViewRef.current?.injectJavaScript(BODYGRAM_INJECTED_SCRIPT);
          }}
          onLoadEnd={() => {
            webViewRef.current?.injectJavaScript(BODYGRAM_LIGHT_THEME_SCRIPT);
          }}
        />
      ) : (
        <View style={styles.centered}>
          {isFetchingToken ? (
            <>
              <ActivityIndicator color={colors.white} size="large" />
              <Text
                color={colors.white}
                weight="semibold"
                size={16}
                style={styles.loadingText}
              >
                Preparing scanner...
              </Text>
            </>
          ) : null}

          {scanError && !isFetchingToken ? (
            <>
              <Text
                color={colors.white}
                weight="bold"
                size={18}
                position="center"
              >
                Scan Failed
              </Text>
              <Text
                color={colors.white}
                size={14}
                position="center"
                style={styles.errorMessage}
              >
                {scanError}
              </Text>
              <Row gap={12} justify="center" style={styles.errorActions}>
                <Button
                  text="Go Back"
                  type="secondary"
                  onPress={goBack}
                  style={styles.errorBtn}
                />
                <Button
                  text="Retry"
                  onPress={restartScanner}
                  style={styles.errorBtn}
                />
              </Row>
            </>
          ) : null}
        </View>
      )}

      <Touchable onPress={goBack} style={styles.chromeBtn}>
        <Icon source={images.back} size={22} tint_color={colors.white} />
      </Touchable>

      {scannerUrl && !scanError && !isProcessing && !isSubmitting ? (
        <Touchable onPress={onFlipCamera} style={[styles.chromeBtn, styles.flipBtn]}>
          <Icon source={images.flip} size={22} tint_color={colors.white} />
        </Touchable>
      ) : null}

      {(isProcessing || isSubmitting) && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator color={colors.white} size="large" />
          <Text
            color={colors.white}
            weight="semibold"
            size={16}
            style={styles.loadingText}
          >
            Processing scan...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
  },
  webview: {
    flex: 1,
    // Light canvas so Bodygram how-to-scan copy stays readable in dark app theme.
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: widthPixel(24),
    gap: heightPixel(16),
  },
  backBtn: {
    width: widthPixel(160),
  },
  chromeBtn: {
    position: 'absolute',
    top: heightPixel(50),
    left: widthPixel(20),
    zIndex: 40,
    height: heightPixel(44),
    width: heightPixel(44),
    borderRadius: heightPixel(22),
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipBtn: {
    left: undefined,
    right: widthPixel(20),
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: heightPixel(12),
  },
  errorMessage: {
    marginTop: heightPixel(10),
    marginBottom: heightPixel(24),
    opacity: 0.9,
  },
  errorActions: {
    width: '100%',
  },
  errorBtn: {
    flex: 1,
  },
});

export default Scan;
