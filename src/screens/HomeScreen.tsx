import { ActivityIndicator, View } from 'react-native';
import { useMemo } from 'react';
import images from '../assets/images';
import Row from '../components/Row';
import Text from '../components/Text';
import TrackingCard from '../components/Cards/TrackingCard';
import { useHealthData } from '../hooks/useHealthData';
import colors from '../utils/colors';
import { heightPixel, widthPixel } from '../utils/helper';

function sourceLabel(
  source: 'live' | 'cache' | 'backend' | null,
): string | null {
  if (source === 'live') {
    return 'Live';
  }
  if (source === 'cache') {
    return 'Cached';
  }
  if (source === 'backend') {
    return 'Synced';
  }
  return null;
}

function formatTime(d: Date | null): string {
  if (!d) {
    return '—';
  }
  try {
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Home health summary: watch-backed steps and active calories with source and freshness hints.
 */
export default function HomeScreen() {
  const { steps, activeCalories, loading, lastUpdated, source } =
    useHealthData();

  const caloriesRingProgress = useMemo(
    () => Math.min(100, Math.round((activeCalories / 2500) * 100)),
    [activeCalories],
  );

  const stepsDisplay =
    loading || (steps === 0 && source === null) ? '—' : steps.toLocaleString();
  const caloriesDisplay =
    loading || (activeCalories === 0 && source === null)
      ? '—'
      : String(activeCalories);

  const src = sourceLabel(source);

  return (
    <View style={{ marginTop: heightPixel(8) }}>
      {loading ? (
        <View
          style={{
            paddingVertical: heightPixel(24),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <>
          <Row justify="space-between">
            <View style={{ padding: heightPixel(8), width: '50%' }}>
              <TrackingCard
                icon={images.steps}
                title="Steps"
                progress={stepsDisplay}
                subtext="Steps"
              />
            </View>
            <View style={{ padding: heightPixel(8), width: '50%' }}>
              <TrackingCard
                title="Calories"
                progress={caloriesDisplay}
                subtext="kcal"
                type="progress"
                ringProgress={caloriesRingProgress}
              />
            </View>
          </Row>
          <View style={{ paddingHorizontal: widthPixel(8), gap: heightPixel(4) }}>
            {src ? (
              <Text size={11} color={colors.icon_gray}>
                Source: {src}
              </Text>
            ) : null}
            <Text size={11} color={colors.icon_gray}>
              Last updated: {formatTime(lastUpdated)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
