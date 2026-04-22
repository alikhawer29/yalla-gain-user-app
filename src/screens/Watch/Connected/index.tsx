/**
 * Watch "Connected" — Figma: file hKEbq9iM9t3wzCuroWuqUK
 * Main metrics row icons: node 192:1874 (children 192:1876 calories, 192:1880 heart, 192:1886 steps)
 */
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, G, Path } from 'react-native-svg';
import Wrapper from '../../../components/Wrapper';
import Text from '../../../components/Text';
import Icon from '../../../components/Icon';
import Image from '../../../components/Image';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';
import { goBack } from '../../../utils/navigation';
import images from '../../../assets/images';
import { useAppSelector } from '../../../hooks';
import { selectUser } from '../../../redux/Slices/AuthSlice';
import { getMetrics, WatchMetrics } from '../../../services/health/healthProvider';

const FIGMA = {
  teal: '#118076',
  cardBorder: '#118076',
  cardInner: '#1F1F1F',
  corner: 57,
  cardW: 344,
  cardH: 410,
  shadow: '#0b0b0b',
  muted: '#999999',
  dotActive: '#FFFFFF',
  dotInactive: '#2A2A2A',
};

const CARD_PAD_X = widthPixel(18);
const PAGER_MIN_H = heightPixel(340);

const WatchConnected = () => {
  const user = useAppSelector(selectUser);
  const firstName = useMemo(() => {
    const raw = user?.first_name;
    const n = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
    return n.length > 0 ? n : 'there';
  }, [user?.first_name]);

  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [cardWidth, setCardWidth] = useState(() => {
    const inner = Math.min(widthPixel(339), Dimensions.get('window').width - widthPixel(40));
    return Math.max(1, inner - CARD_PAD_X * 2);
  });
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<WatchMetrics>({});
  const [errorText, setErrorText] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setErrorText(null);
    setLoading(true);
    try {
      const m = await getMetrics();
      setMetrics(m);
    } catch (e: any) {
      setErrorText(e?.message || 'Unable to load health data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSilent = useCallback(async () => {
    try {
      const m = await getMetrics();
      setMetrics(m);
    } catch {
      /* ignore */
    }
  }, []);

  /** HealthKit/Health Connect have no “push” to the app; data is read when `getMetrics` runs. Refetch on every focus and via Sync so new Watch data on the device shows up without waiting for the 30s poll. */
  const hasHadFirstFocus = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasHadFirstFocus.current) {
        hasHadFirstFocus.current = true;
        void refresh();
      } else {
        void refreshSilent();
      }
      const id = setInterval(() => {
        void refreshSilent();
      }, 30000);
      return () => clearInterval(id);
    }, [refresh, refreshSilent]),
  );

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / Math.max(1, cardWidth));
    setPage(idx);
  };

  const onCardLayout = (e: LayoutChangeEvent) => {
    const inner = e.nativeEvent.layout.width;
    const pageW = inner - CARD_PAD_X * 2;
    if (pageW > 0 && Math.abs(pageW - cardWidth) > 1) {
      setCardWidth(pageW);
    }
  };

  const caloriesText = useMemo(() => {
    const kcal = metrics.caloriesKcal;
    if (typeof kcal !== 'number') return '— cal';
    return `${Math.round(kcal).toLocaleString()} cal`;
  }, [metrics.caloriesKcal]);

  const bpmText = useMemo(() => {
    const bpm = metrics.heartRateBpm;
    if (typeof bpm !== 'number') return '— bpm';
    return `${Math.round(bpm)} bpm`;
  }, [metrics.heartRateBpm]);

  const stepsText = useMemo(() => {
    const s = metrics.steps;
    if (typeof s !== 'number') return '—';
    return `${Math.round(s).toLocaleString()}`;
  }, [metrics.steps]);

  const heartRateAgoText = useMemo(() => {
    if (!metrics.heartRateAt) return '';
    const mins = Math.max(0, dayjs().diff(dayjs(metrics.heartRateAt), 'minute'));
    return `${mins} min ago`;
  }, [metrics.heartRateAt]);

  const hasWorkout = typeof metrics.workoutDurationSec === 'number' && metrics.workoutDurationSec > 0;

  const workoutRingSubtitle = useMemo(() => {
    if (loading) return ' ';
    if (!hasWorkout) return 'No recent workout';
    return metrics.workoutActivityName?.trim() || 'Last workout';
  }, [loading, hasWorkout, metrics.workoutActivityName]);

  /** HealthKit / Health Connect expose `activityName` (e.g. Walking, Running) — used for the subtitle under “Nice Job”. */
  const cardSubtitle = useMemo(() => {
    if (loading) return ' ';
    const name = metrics.workoutActivityName?.trim();
    if (hasWorkout && name) {
      return `Nice work on your ${name.toLowerCase()} workout!`;
    }
    if (hasWorkout) {
      return 'Nice work on your latest workout!';
    }
    return 'Here’s your synced health data.';
  }, [loading, hasWorkout, metrics.workoutActivityName]);

  return (
    <Wrapper no_padding>
      <LinearGradient
        colors={[FIGMA.teal, 'rgba(17,128,118,0)']}
        style={styles.topTealGlow}
        pointerEvents="none"
      />
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
              Connected
            </Text>
          </View>
          <View style={styles.headerSideRight}>
            <Pressable
              onPress={() => void refresh()}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
              disabled={loading}
              style={({ pressed }) => [{ opacity: loading ? 0.45 : pressed ? 0.65 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Sync latest health data from Apple Health"
            >
              <Text size={13} weight="semibold" color={FIGMA.teal} position="right">
                Sync
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.pagerWrap}>
          <View style={styles.cardOuter}>
            <View style={styles.cardInner} onLayout={onCardLayout}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
                style={[styles.hScroll, { width: cardWidth }]}
                contentContainerStyle={styles.hScrollContent}
              >
                <MainPage
                  width={cardWidth}
                  firstName={firstName}
                  cardSubtitle={cardSubtitle}
                  loading={loading}
                  hasWorkout={hasWorkout}
                  durationSec={metrics.workoutDurationSec ?? 0}
                  workoutSubtitle={workoutRingSubtitle}
                  caloriesText={caloriesText}
                  bpmText={bpmText}
                  stepsValue={metrics.steps}
                  errorText={errorText}
                />
                <BpmPage
                  width={cardWidth}
                  firstName={firstName}
                  cardSubtitle={cardSubtitle}
                  loading={loading}
                  bpmText={bpmText}
                  agoText={heartRateAgoText}
                />
                <CaloriesPage
                  width={cardWidth}
                  firstName={firstName}
                  cardSubtitle={cardSubtitle}
                  caloriesText={caloriesText}
                />
                <StepsPage width={cardWidth} stepsText={stepsText} />
              </ScrollView>

              <View style={styles.pageDots}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      { backgroundColor: page === i ? FIGMA.dotActive : FIGMA.dotInactive },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Wrapper>
  );
};

const CardHeader = ({ firstName, subtitle }: { firstName: string; subtitle: string }) => (
  <>
    <Text size={24} weight="bold" position="center" line_height={40}>
      {`Nice Job, ${firstName}!`}
    </Text>
    <Text
      size={14}
      weight="regular"
      position="center"
      color={FIGMA.muted}
      style={styles.subtitle}
    >
      {subtitle}
    </Text>
  </>
);

const MainPage = ({
  width,
  firstName,
  cardSubtitle,
  loading,
  hasWorkout,
  durationSec,
  workoutSubtitle,
  caloriesText,
  bpmText,
  stepsValue,
  errorText,
}: {
  width: number;
  firstName: string;
  cardSubtitle: string;
  loading: boolean;
  hasWorkout: boolean;
  durationSec: number;
  workoutSubtitle: string;
  caloriesText: string;
  bpmText: string;
  stepsValue?: number;
  errorText: string | null;
}) => {
  const durationLabel = useMemo(() => {
    if (!hasWorkout) return '—:—';
    const mins = Math.floor(durationSec / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(durationSec % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  }, [hasWorkout, durationSec]);

  const progress = loading ? 0.75 : hasWorkout ? 1 : 0;

  return (
    <View style={[styles.page, { width, minHeight: PAGER_MIN_H }]}>
      <CardHeader firstName={firstName} subtitle={cardSubtitle} />
      {!!errorText && (
        <Text size={13} color={colors.icon_gray} position="center" style={{ marginTop: heightPixel(8) }}>
          {errorText}
        </Text>
      )}
      <View style={styles.mainRingSection}>
        <RingProgress
          value={progress}
          centerTop={durationLabel}
          centerBottom={workoutSubtitle}
          centerTopSize={22}
        />
      </View>
      <View style={styles.metricsRow}>
        <Metric label={caloriesText} variant="flame" />
        <Metric label={bpmText} variant="heart" />
        <Metric
          label={typeof stepsValue === 'number' ? Math.round(stepsValue).toLocaleString() : '—'}
          variant="shoe"
        />
      </View>
    </View>
  );
};

const BpmPage = ({
  width,
  firstName,
  cardSubtitle,
  loading,
  bpmText,
  agoText,
}: {
  width: number;
  firstName: string;
  cardSubtitle: string;
  loading: boolean;
  bpmText: string;
  agoText: string;
}) => {
  return (
    <View style={[styles.page, styles.pageColumn, { width, minHeight: PAGER_MIN_H }]}>
      <CardHeader firstName={firstName} subtitle={cardSubtitle} />
      <View style={styles.bpmRingSection}>
        <View style={{ alignItems: 'center' }}>
          <RingProgress
            value={loading ? 0.62 : 0.62}
            centerTop={bpmText}
            centerBottom={agoText || ' '}
            centerTopSize={22}
          />
        </View>
        <Text size={24} weight="bold" position="center" style={{ marginBottom: heightPixel(6) }}>
          Current
        </Text>
      </View>
    </View>
  );
};

/** Figma 192:2054 — bars left→right (white / grey / teal) */
const CALORIES_BARS: { h: number; c: string }[] = [
  { h: 36, c: colors.white },
  { h: 56, c: '#2A2A2A' },
  { h: 72, c: colors.white },
  { h: 56, c: '#2A2A2A' },
  { h: 64, c: FIGMA.teal },
  { h: 88, c: '#2A2A2A' },
  { h: 48, c: FIGMA.teal },
  { h: 62, c: '#2A2A2A' },
];

const CaloriesPage = ({
  width,
  firstName,
  cardSubtitle,
  caloriesText,
}: {
  width: number;
  firstName: string;
  cardSubtitle: string;
  caloriesText: string;
}) => {
  return (
    <View style={[styles.page, styles.pageColumn, { width, minHeight: PAGER_MIN_H }]}>
      <CardHeader firstName={firstName} subtitle={cardSubtitle} />
      <View style={styles.equalizer}>
        {CALORIES_BARS.map((b, idx) => (
          <View
            key={`bar-${idx}`}
            style={[
              styles.bar,
              { height: heightPixel(b.h), backgroundColor: b.c },
            ]}
          />
        ))}
      </View>
      <View style={styles.caloriesSingleMetricWrap}>
        <Metric label={caloriesText} variant="flame" />
      </View>
      <Text size={24} weight="bold" position="center" style={{ marginTop: heightPixel(10) }}>
        Calories
      </Text>
    </View>
  );
};

const StepsPage = ({ width, stepsText }: { width: number; stepsText: string }) => {
  return (
    <View style={[styles.page, styles.pageColumn, styles.stepsPage, { width, minHeight: PAGER_MIN_H }]}>
      <Text size={46} weight="bold" position="center" line_height={52} style={{ marginTop: heightPixel(4) }}>
        {stepsText}
      </Text>
      <Text
        size={18}
        weight="regular"
        position="center"
        color={FIGMA.muted}
        style={{ marginTop: heightPixel(8) }}
      >
        Steps
      </Text>
      <View style={styles.waveWrap}>
        <StepsWave />
      </View>
    </View>
  );
};

const Metric = ({ label, variant }: { label: string; variant: 'flame' | 'heart' | 'shoe' }) => {
  const iconSource = useMemo(() => {
    if (variant === 'heart') {
      return images.watch_connected.metric_heart;
    }
    if (variant === 'shoe') {
      return images.watch_connected.metric_steps;
    }
    return images.watch_connected.metric_calories;
  }, [variant]);

  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}>
        <Image source={iconSource} style={styles.metricIconImg} resize="contain" />
      </View>
      <Text size={14} weight="bold" position="center" style={{ marginTop: heightPixel(8) }}>
        {label}
      </Text>
    </View>
  );
};

const RingProgress = ({
  value,
  centerTop,
  centerBottom,
  centerTopSize,
}: {
  value: number;
  centerTop: string;
  centerBottom: string;
  centerTopSize?: number;
}) => {
  const size = widthPixel(220);
  const stroke = widthPixel(12);
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const dashOffset = c * (1 - clamped);
  const rDots = r - widthPixel(14);
  const angle = -Math.PI / 2 + clamped * 2 * Math.PI;
  const knobR = widthPixel(15);
  const knobStroke = widthPixel(2.5);
  const knobX = cx + r * Math.cos(angle);
  const knobY = cy + r * Math.sin(angle);
  /** Padding inside the SVG so the thumb (extends past the arc) isn’t clipped at top/sides. */
  const ringSvgInset = knobR + knobStroke + widthPixel(4);
  const svgSize = size + 2 * ringSvgInset;

  return (
    <View style={styles.ringWrap}>
      <View
        style={{
          width: svgSize,
          height: svgSize,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={svgSize} height={svgSize}>
          <G transform={`translate(${ringSvgInset}, ${ringSvgInset})`}>
            <Circle cx={cx} cy={cy} r={r} stroke="#0F0F0F" strokeWidth={stroke} fill="none" />
            <Circle
              cx={cx}
              cy={cy}
              r={rDots}
              stroke="rgba(17,128,118,0.35)"
              strokeWidth={2}
              fill="none"
              strokeDasharray="4 10"
              strokeLinecap="round"
            />
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={FIGMA.teal}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={dashOffset}
              rotation={-90}
              originX={cx}
              originY={cy}
            />
            <Circle
              cx={knobX}
              cy={knobY}
              r={knobR}
              fill={FIGMA.teal}
              stroke="rgba(255,255,255,0.92)"
              strokeWidth={knobStroke}
            />
          </G>
        </Svg>
        <View style={[styles.ringCenter, { width: svgSize, height: svgSize }]}>
          <Text
            size={centerTopSize ?? 22}
            weight="bold"
            position="center"
            line_height={40}
          >
            {centerTop}
          </Text>
          <Text size={14} weight="regular" color={FIGMA.muted} position="center">
            {centerBottom}
          </Text>
        </View>
      </View>
    </View>
  );
};

/** Teal wave path (Figma 192:2143 vector) */
const StepsWave = () => {
  const w = widthPixel(313);
  const h = heightPixel(107);
  return (
    <Svg width={w} height={h} viewBox="0 0 313 107">
      <Path
        d="M0,58 C45,22 90,92 140,48 S220,88 270,42 S300,72 313,56"
        fill="none"
        stroke={FIGMA.teal}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  topTealGlow: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: widthPixel(136),
    height: heightPixel(204),
    zIndex: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(50),
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: heightPixel(20),
    width: '100%',
  },
  /** Same width as `headerSideRight` so the title stays visually centered (was drifting when sides differed). */
  headerSide: {
    width: widthPixel(88),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerSideRight: {
    width: widthPixel(88),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerWrap: {
    flex: 1,
    alignItems: 'center',
  },
  cardOuter: {
    width: '100%',
    maxWidth: widthPixel(FIGMA.cardW),
    borderRadius: heightPixel(FIGMA.corner),
    backgroundColor: FIGMA.cardBorder,
    padding: widthPixel(2),
    shadowColor: FIGMA.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  cardInner: {
    width: '100%',
    borderRadius: heightPixel(FIGMA.corner),
    backgroundColor: FIGMA.cardInner,
    paddingTop: heightPixel(22),
    paddingHorizontal: CARD_PAD_X,
    paddingBottom: heightPixel(14),
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: heightPixel(FIGMA.cardH),
  },
  hScroll: {
    alignSelf: 'center',
  },
  hScrollContent: {
    alignItems: 'stretch',
  },
  subtitle: {
    marginTop: heightPixel(4),
  },
  page: {
    alignItems: 'center',
    paddingBottom: heightPixel(8),
  },
  pageColumn: {
    justifyContent: 'flex-start',
  },
  /** Steps pager has no CardHeader — extra top inset so the count / wave don’t crowd the card edge. */
  stepsPage: {
    paddingTop: heightPixel(28),
    width: '100%',
  },
  caloriesSingleMetricWrap: {
    marginTop: heightPixel(14),
    width: '100%',
    alignItems: 'center',
  },
  mainRingSection: {
    marginTop: heightPixel(24),
    alignItems: 'center',
    width: '100%',
  },
  bpmRingSection: {
    marginTop: heightPixel(20),
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  ringWrap: {
    alignItems: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: heightPixel(18),
    width: '100%',
    paddingHorizontal: widthPixel(8),
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
    width: widthPixel(92),
  },
  metricIcon: {
    width: widthPixel(33),
    height: widthPixel(33),
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconImg: {
    width: widthPixel(33),
    height: widthPixel(33),
  },
  pageDots: {
    flexDirection: 'row',
    gap: widthPixel(8),
    marginTop: heightPixel(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: widthPixel(8),
    height: widthPixel(8),
    borderRadius: widthPixel(8),
  },
  equalizer: {
    flexDirection: 'row',
    gap: widthPixel(10),
    alignItems: 'flex-end',
    marginTop: heightPixel(24),
    height: heightPixel(100),
  },
  bar: {
    width: widthPixel(16),
    borderRadius: widthPixel(8),
  },
  waveWrap: {
    marginTop: heightPixel(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WatchConnected;