import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Wrapper from '../../../components/Wrapper';
import Text from '../../../components/Text';
import Icon from '../../../components/Icon';
import Image from '../../../components/Image';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';
import { goBack } from '../../../utils/navigation';
import images from '../../../assets/images';
import { getMetrics, WatchMetrics } from '../../../services/health/healthProvider';

const CARD_W = widthPixel(339);
const PAGER_H = heightPixel(320);

const WatchConnected = () => {
  const scrollRef = useRef<any>(null);
  const [page, setPage] = useState(0);
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

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / CARD_W);
    setPage(idx);
  };

  const caloriesText = useMemo(() => {
    const kcal = metrics.caloriesKcal;
    if (typeof kcal !== 'number') return '— cal';
    return `${Math.round(kcal)} cal`;
  }, [metrics.caloriesKcal]);

  const bpmText = useMemo(() => {
    const bpm = metrics.heartRateBpm;
    if (typeof bpm !== 'number') return '— bpm';
    return `${Math.round(bpm)} bpm`;
  }, [metrics.heartRateBpm]);

  const stepsText = useMemo(() => {
    const s = metrics.steps;
    if (typeof s !== 'number') return '—';
    return `${Math.round(s)}`;
  }, [metrics.steps]);

  const heartRateAgoText = useMemo(() => {
    if (!metrics.heartRateAt) return '';
    const mins = Math.max(0, dayjs().diff(dayjs(metrics.heartRateAt), 'minute'));
    return `${mins} min ago`;
  }, [metrics.heartRateAt]);

  return (
    <Wrapper no_padding>
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon
            source={images.back}
            size={40}
            rounded
            less_rounded
            less_padding
            border={colors.white}
            onPress={goBack}
          />
          <Text size={24} weight="semibold" style={styles.headerTitle}>
            Connected
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.pagerWrap}>
          <View style={styles.cardOuter}>
            <View style={styles.cardInner}>
              <Text size={24} weight="bold" position="center" line_height={30}>
                Nice Job, Josh!
              </Text>
              <Text
                size={14}
                weight="regular"
                position="center"
                color={colors.icon_gray}
                style={{ marginTop: heightPixel(6) }}
              >
                You just finished your cardio workout set
              </Text>

              {!!errorText && (
                <Text
                  size={13}
                  color={colors.icon_gray}
                  position="center"
                  style={{ marginTop: heightPixel(12) }}
                >
                  {errorText}
                </Text>
              )}

              <View style={{ marginTop: heightPixel(18) }}>
                <Pager
                  ref={scrollRef}
                  page={page}
                  onScrollEnd={onScrollEnd}
                  loading={loading}
                  metrics={metrics}
                  caloriesText={caloriesText}
                  bpmText={bpmText}
                  stepsText={stepsText}
                  heartRateAgoText={heartRateAgoText}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Wrapper>
  );
};

const Pager = React.forwardRef<
  any,
  {
    page: number;
    onScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
    loading: boolean;
    metrics: WatchMetrics;
    caloriesText: string;
    bpmText: string;
    stepsText: string;
    heartRateAgoText: string;
  }
>(function PagerImpl(
  { onScrollEnd, loading, metrics, caloriesText, bpmText, stepsText, heartRateAgoText },
  ref,
) {
  const totalSec = metrics.workoutTotalDurationSec ?? 20 * 60;
  const doneSec = metrics.workoutDurationSec ?? Math.min(15 * 60 + 20, totalSec);

  return (
    <View>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={{ width: CARD_W, height: PAGER_H }}
      >
        <MainPage
          loading={loading}
          durationSec={doneSec}
          totalDurationSec={totalSec}
          caloriesText={caloriesText}
          bpmText={bpmText}
          stepsValue={metrics.steps}
        />
        <BpmPage loading={loading} bpmText={bpmText} agoText={heartRateAgoText} />
        <CaloriesPage />
        <StepsPage stepsText={stepsText} />
      </ScrollView>
    </View>
  );
});

const MainPage = ({
  loading,
  durationSec,
  totalDurationSec,
  caloriesText,
  bpmText,
  stepsValue,
}: {
  loading: boolean;
  durationSec: number;
  totalDurationSec: number;
  caloriesText: string;
  bpmText: string;
  stepsValue?: number;
}) => {
  const durationLabel = useMemo(() => {
    const mins = Math.floor(durationSec / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(durationSec % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  }, [durationSec]);

  const totalLabel = useMemo(() => {
    const mins = Math.floor(totalDurationSec / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(totalDurationSec % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  }, [totalDurationSec]);

  return (
    <View style={styles.page}>
      <RingProgress
        value={loading ? 0.75 : durationSec / Math.max(1, totalDurationSec)}
        centerTop={durationLabel}
        centerBottom={`of ${totalLabel} total`}
      />

      <View style={styles.metricsRow}>
        <Metric label={caloriesText} icon="flame" />
        <Metric label={bpmText} icon="pulse" />
        <Metric
          label={
            typeof stepsValue === 'number' ? stepsValue.toLocaleString() : '—'
          }
          icon="shoe"
        />
      </View>
    </View>
  );
};

const BpmPage = ({
  loading,
  bpmText,
  agoText,
}: {
  loading: boolean;
  bpmText: string;
  agoText: string;
}) => {
  return (
    <View style={styles.page}>
      <View style={{ marginTop: heightPixel(10) }}>
        <RingProgress
          value={loading ? 0.62 : 0.62}
          centerTop={bpmText}
          centerBottom={agoText || ' '}
          topLabel="Current"
        />
      </View>
    </View>
  );
};

const CaloriesPage = () => {
  return (
    <View style={styles.page}>
      <View style={styles.carouselDots}>
        <Dot active />
        <Dot />
        <Dot />
      </View>
      <View style={styles.equalizer}>
        {[
          { h: 54, c: colors.white },
          { h: 92, c: '#111111' },
          { h: 110, c: '#111111' },
          { h: 110, c: '#111111' },
          { h: 78, c: colors.white },
          { h: 98, c: colors.primary },
          { h: 62, c: '#111111' },
          { h: 84, c: colors.primary },
        ].map((b, idx) => (
          <View
            key={`bar-${idx}`}
            style={[
              styles.bar,
              { height: heightPixel(b.h), backgroundColor: b.c },
            ]}
          />
        ))}
      </View>
      <Text size={24} weight="bold" position="center" style={{ marginTop: heightPixel(18) }}>
        Calories
      </Text>
    </View>
  );
};

const StepsPage = ({ stepsText }: { stepsText: string }) => {
  return (
    <View style={styles.page}>
      <View style={styles.carouselDots}>
        <Dot />
        <Dot active />
        <Dot />
      </View>
      <Text size={46} weight="bold" position="center" style={{ marginTop: heightPixel(8) }}>
        {stepsText}
      </Text>
      <Text
        size={18}
        weight="regular"
        position="center"
        color={colors.icon_gray}
        style={{ marginTop: heightPixel(4) }}
      >
        Steps
      </Text>
      <View style={{ marginTop: heightPixel(18), alignItems: 'center' }}>
        <Image source={images.steps_graph} style={styles.stepsGraph} resize="contain" />
      </View>
    </View>
  );
};

const Dot = ({ active = false }: { active?: boolean }) => (
  <View
    style={[
      styles.dot,
      { backgroundColor: active ? '#B7B7B7' : '#111111' },
    ]}
  />
);

const Metric = ({ label, icon }: { label: string; icon: 'flame' | 'pulse' | 'shoe' }) => {
  const IconNode = useMemo(() => {
    if (icon === 'pulse') return <Image source={images.heart} style={styles.metricIcon} />;
    return <View style={[styles.metricIcon, { backgroundColor: colors.primary, borderRadius: 6 }]} />;
  }, [icon]);

  return (
    <View style={styles.metric}>
      {IconNode}
      <Text size={14} weight="bold" position="center" style={{ marginTop: heightPixel(6) }}>
        {label}
      </Text>
    </View>
  );
};

const RingProgress = ({
  value,
  centerTop,
  centerBottom,
  topLabel,
}: {
  value: number;
  centerTop: string;
  centerBottom: string;
  topLabel?: string;
}) => {
  const size = widthPixel(220);
  const stroke = widthPixel(12);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const dashOffset = c * (1 - clamped);

  return (
    <View style={styles.ringWrap}>
      {!!topLabel && (
        <Text size={24} weight="bold" position="center" style={{ marginBottom: heightPixel(6) }}>
          {topLabel}
        </Text>
      )}
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="#0F0F0F"
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.primary}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={dashOffset}
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text size={22} weight="bold" position="center" line_height={28}>
            {centerTop}
          </Text>
          <Text size={14} color={colors.icon_gray} position="center">
            {centerBottom}
          </Text>
        </View>
      </View>
    </View>
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
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: heightPixel(40),
  },
  pagerWrap: {
    flex: 1,
    alignItems: 'center',
  },
  cardOuter: {
    width: widthPixel(344),
    borderRadius: heightPixel(57),
    backgroundColor: colors.primary,
    padding: widthPixel(2),
    shadowColor: '#0b0b0b',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  cardInner: {
    width: '100%',
    borderRadius: heightPixel(57),
    backgroundColor: colors.blackish_gray,
    paddingTop: heightPixel(24),
    paddingHorizontal: widthPixel(18),
    paddingBottom: heightPixel(18),
    alignItems: 'center',
  },
  pagerMask: {
    width: '100%',
  },
  page: {
    width: CARD_W,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: widthPixel(280),
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
    width: widthPixel(80),
  },
  metricIcon: {
    width: widthPixel(28),
    height: widthPixel(28),
  },
  carouselDots: {
    flexDirection: 'row',
    gap: widthPixel(8),
    marginBottom: heightPixel(14),
  },
  dot: {
    width: widthPixel(10),
    height: widthPixel(10),
    borderRadius: widthPixel(10),
  },
  equalizer: {
    flexDirection: 'row',
    gap: widthPixel(10),
    alignItems: 'flex-end',
    marginTop: heightPixel(24),
  },
  bar: {
    width: widthPixel(16),
    borderRadius: widthPixel(7),
  },
  stepsGraph: {
    width: widthPixel(313),
    height: heightPixel(107),
  },
});

export default WatchConnected;

