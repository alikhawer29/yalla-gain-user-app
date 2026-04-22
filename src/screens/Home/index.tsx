import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useMemo, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native"
import { LineChart } from "react-native-chart-kit"
import fonts from "../../assets/fonts"
import images from "../../assets/images"
import InfoCard from "../../components/Cards/InfoCard"
import ProgressCard from "../../components/Cards/ProgressCard"
import TrackingCard from "../../components/Cards/TrackingCard"
import VideoCard from "../../components/Cards/VideoCard"
import Dropdown from "../../components/Dropdown"
import ProfileHeader from "../../components/ProfileHeader"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import Wrapper from "../../components/Wrapper"
import { useGetDashboardQuery, useGetWorkoutQuery } from "../../redux/Apis/User"
import colors from "../../utils/colors"
import { getProgressTrackingIconSource } from "../../utils/data"
import { font, heightPixel, vw, widthPixel } from "../../utils/helper"
import { navigateToChallenges, navigateToWorkout, navigationRef } from '../../utils/navigation'
import { NAVIGATORS, ROUTES } from "../../utils/routes"

type DashboardPayload = {
    steps?: number
    calories?: number
    challenges_completed_count?: number
    workout_progress?: { minutes?: number; percentage?: number }
    level?: number,
    progress_tracking?:
        | Array<{
              id?: number
              challenge_name?: string
              percentage?: number
              image?: string
              image_url?: string
          }>
        | {
              id?: number
              challenge_name?: string
              percentage?: number
              image?: string
              image_url?: string
          }
}

const Home = () => {
    const {
        data: workoutData,
        isLoading: workoutLoading,
        isFetching,
        refetch,
    } = useGetWorkoutQuery(undefined);
    const {
        data: dashboardRaw,
        isLoading: dashboardLoading,
        isFetching: dashboardFetching,
        refetch: refetchDashboard,
    } = useGetDashboardQuery(undefined);

    const dashboard = useMemo((): DashboardPayload => {
        const root = dashboardRaw as { data?: DashboardPayload } | undefined
        return root?.data ?? {}
    }, [dashboardRaw])

    const steps = Number(dashboard.steps ?? 0)
    const calories = Number(dashboard.calories ?? 0)
    const challengesCompleted = Number(dashboard.challenges_completed_count ?? 0)
    const workoutMinutes = Number(dashboard.workout_progress?.minutes ?? 0)
    const workoutPercentage = Math.min(
        100,
        Math.max(0, Number(dashboard.workout_progress?.percentage ?? 0)),
    )
    /** Ring fill vs a 2500 kcal daily reference (adjust if product defines another goal). */
    const caloriesRingProgress = useMemo(
        () => Math.min(100, Math.round((calories / 2500) * 100)),
        [calories],
    )

    const level = useMemo(() => {
        return dashboard?.level ?? 0
    }, [dashboardRaw])

    const progressTracking = useMemo(() => {
        const raw = dashboard?.progress_tracking
        if (Array.isArray(raw)) return raw
        if (raw && typeof raw === 'object') return [raw]
        return []
    }, [dashboard])

    const [calorieFilter, setCalorieFilter] = useState('Weekly')
    const calorieOptions = [
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' },
    ]
    const recommendedVideos = workoutData?.data || []

    /** Refetch dashboard when Home tab/screen is opened. */
    useFocusEffect(
        useCallback(() => {
            void refetchDashboard()
        }, [refetchDashboard]),
    )

    const lastScrollRefetchAt = useRef(0)
    const onScrollRefetchDashboard = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const y = e.nativeEvent.contentOffset.y
            if (y < 80) return
            const now = Date.now()
            if (now - lastScrollRefetchAt.current < 4000) return
            lastScrollRefetchAt.current = now
            void refetchDashboard()
        },
        [refetchDashboard],
    )

    const workoutCardImage = (item: {
        image?: string;
        image_url?: string;
        thumbnail?: string;
    }) => {
        const raw = item?.image_url ?? item?.image ?? item?.thumbnail;
        const uri = typeof raw === 'string' ? raw.trim() : '';
        return uri ? { uri } : images.dummy;
    };

    const navigateToWorkoutDetails = (id: number, muscle_id?: number) => {
        if (navigationRef.isReady()) {
            (navigationRef as any).navigate(NAVIGATORS.WORKOUT_STACK, {
                screen: ROUTES.WORKOUT_DETAILS,
                params: {
                    id,
                    ...(muscle_id != null ? { muscle_id } : {}),
                },
            });
        }
    };

    const data = {
        labels: ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: [50, 95, 20, 50, 20, 80, 40],
                color: (opacity = 1) => colors.primary, // optional
                strokeWidth: 0 // optional
            }
        ],
    };

    return (
        <Wrapper
            bottom_bar
            scrollable
            floating
            onScroll={onScrollRefetchDashboard}
            onRefresh={() => {
                void refetch()
                void refetchDashboard()
            }}
            refreshing={
                (isFetching && !workoutLoading) ||
                (dashboardFetching && !dashboardLoading)
            }
        >
            <ProfileHeader />
            <View style={{ marginTop: heightPixel(30) }}>
                <InfoCard />
            </View>
            <View style={{ marginTop: heightPixel(30) }}>
                <Row justify="space-between">
                    <View style={{ padding: heightPixel(8), width: "50%" }}>
                        <TrackingCard
                            icon={images.steps_graph}
                            title="Steps"
                            progress={steps}
                            subtext="Steps"
                        />
                    </View>
                    <View style={{ padding: heightPixel(8), width: "50%" }}>
                        <TrackingCard
                            title="Calories"
                            progress={calories}
                            subtext="Cal"
                            type="progress"
                            ringProgress={caloriesRingProgress}
                        />
                    </View>
                </Row>
                <Row justify="space-between">
                    <Touchable style={{ padding: heightPixel(8), width: "50%" }} onPress={() => navigateToChallenges()}>
                        <TrackingCard
                            icon={images.challenge_graph}
                            title="Challenges"
                            progress={challengesCompleted}
                            subtext="Completed"
                        />
                    </Touchable>
                    <View style={{ padding: heightPixel(8), width: "50%" }}>
                        <TrackingCard
                            title="Workout Progress"
                            progress={`${workoutPercentage}%`}
                            type="workout"
                            stats={[
                                { icon: images.cal, text: `${workoutMinutes} Day Left` },
                            ]}
                        />
                    </View>
                </Row>
            </View>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Text weight="semibold" size={20}>Recommended Videos</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                    {recommendedVideos.map((item: any, index: number) => (
                        <View key={item?.id ?? index} style={{ marginRight: widthPixel(10) }}>
                            <VideoCard
                                title={item.title}
                                muscle_title={item.muscle_title}
                                exercise_title={item.exercise_title}
                                language={item.language}
                                description={item.description}
                                created_at={item.created_at}
                                image={workoutCardImage(item)}
                                video_count={item.video_count}
                                show_video_count
                                type="secondary"
                                is_video={true}
                                onPress={() =>
                                    navigateToWorkoutDetails(
                                        item.id,
                                        (item as { muscle_id?: number }).muscle_id,
                                    )
                                }
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Row justify="space-between" align="center">
                    <Text weight="semibold" size={20}>Progress Tracking</Text>
                    <Text weight="semibold" size={20}>Level {level}</Text>
                </Row>
                {progressTracking.length === 0 ? (
                    <Text size={14} color={colors.icon_gray} style={{ paddingVertical: heightPixel(8) }}>
                        No progress tracking data yet.
                    </Text>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: "row", alignItems: "flex-start" }}
                    >
                        {progressTracking.map(
                            (
                                item: {
                                    id?: number
                                    challenge_name?: string
                                    percentage?: number
                                    image?: string
                                    image_url?: string
                                },
                                index: number,
                            ) => (
                                <View key={item?.id ?? index} style={{ marginRight: widthPixel(10) }}>
                                    <ProgressCard
                                        icon={getProgressTrackingIconSource(
                                            item?.challenge_name,
                                            item?.image_url ?? item?.image,
                                        )}
                                        title={item?.challenge_name ?? ''}
                                        progress={item?.percentage ?? 0}
                                    />
                                </View>
                            ),
                        )}
                    </ScrollView>
                )}
            </View>
            <View style={{ marginTop: heightPixel(30), width: "100%", gap: heightPixel(15), zIndex: 10 }}>
                <Row justify="space-between" align="center">
                    <Text weight="semibold" size={20}>Calories</Text>
                    <View style={{ width: widthPixel(105) }}>
                        <Dropdown
                            options={calorieOptions}
                            value={calorieFilter}
                            onChangeText={(item: any) => setCalorieFilter(item.value || item)}
                            height={34}
                            placeholder="Weekly"
                            style={{ borderColor: colors.primary, borderRadius: 6, paddingHorizontal: widthPixel(8) }}
                            textStyle={{ color: colors.primary, fontWeight: '600', fontSize: font(12) }}
                            arrowIconStyle={{ tintColor: colors.primary }}
                        />
                    </View>
                </Row>
                <View style={{ marginLeft: -widthPixel(40), }}>
                    <LineChart
                        style={
                            {
                                marginLeft: 0,
                                margin: 0,
                                paddingLeft: 0,
                                padding: 0
                            }
                        }
                        data={data}
                        width={vw * 100}
                        height={heightPixel(240)}
                        chartConfig={{
                            color: () => colors.white,
                            strokeWidth: 0,
                            useShadowColorFromDataset: false,
                            fillShadowGradientFrom: colors.primary,
                            fillShadowGradientFromOpacity: 0.9,
                            fillShadowGradientTo: colors.transparent,
                            propsForBackgroundLines: {
                                strokeDasharray: "",
                                stroke: colors.gray,
                                strokeWidth: 0.5,
                            },
                            decimalPlaces: 0,
                            // backgroundColor: "#e26a00",
                            // backgroundGradientFrom: "#fb8c00",
                            // backgroundGradientTo: "#ffa726",
                            style: {
                                width: "100%",
                                padding: 0
                            }, barPercentage: 1,
                            propsForVerticalLabels: {
                                fontFamily: fonts.sfpro.semibold,
                                fontSize: font(14),

                            },

                            propsForHorizontalLabels: {

                            },
                        }}
                        bezier
                        withDots={false}
                        withVerticalLines={false}
                        withOuterLines={false}
                        fromZero={true}
                    />
                </View>
            </View>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Row justify="space-between" align="center">
                    <Text weight="semibold" size={20}>Workout Plans</Text>
                    <Touchable onPress={() => navigateToWorkout()}>
                        <Text size={14} weight="semibold" underline>See More</Text>
                    </Touchable>
                </Row>
                <View>
                    {recommendedVideos.map((item: any, index: number) => (
                        <View key={item?.id ?? index} style={{ marginBottom: heightPixel(10) }}>
                            <VideoCard
                                title={item.title}
                                muscle_title={item.muscle_title}
                                exercise_title={item.exercise_title}
                                description={item.description}
                                created_at={item.created_at}
                                image={workoutCardImage(item)}
                                video_count={item.video_count}
                                show_video_count
                                type="secondary"
                                is_video={true}
                                onPress={() =>
                                    navigateToWorkoutDetails(
                                        item.id,
                                        (item as { muscle_id?: number }).muscle_id,
                                    )
                                }
                            />
                        </View>
                    ))}
                </View>
            </View>
        </Wrapper>
    )
}

export default Home