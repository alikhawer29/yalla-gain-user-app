import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useMemo, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { LineChart } from "react-native-chart-kit"
import fonts from "../../assets/fonts"
import images from "../../assets/images"
import InfoCard from "../../components/Cards/InfoCard"
import ConsultationSessionCard from "../../components/Cards/ConsultationSessionCard"
import ProgressCard from "../../components/Cards/ProgressCard"
import TrackingCard from "../../components/Cards/TrackingCard"
import VideoCard from "../../components/Cards/VideoCard"
import Dropdown from "../../components/Dropdown"
import ProfileHeader from "../../components/ProfileHeader"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import Wrapper from "../../components/Wrapper"
import {
    userApi,
    useGetCaloriesGraphQuery,
    useGetConsultationSessionsQuery,
    useGetDashboardQuery,
    useGetWorkoutQuery,
    type CaloriesGraphResponse,
    type MonthlyCaloriesDataPoint,
    type WeeklyCaloriesDataPoint,
} from "../../redux/Apis/User"
import colors from "../../utils/colors"
import { getProgressTrackingIconSource } from "../../utils/data"
import { font, heightPixel, vw, widthPixel } from "../../utils/helper"
import { navigateToChallenges, navigateToWorkout, navigationRef } from '../../utils/navigation'
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import { hasPaidSubscriptionPlan } from "../../utils/subscription"
import HomeScreen from "../HomeScreen";

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

function unwrapCaloriesGraphPayload(raw: unknown): CaloriesGraphResponse | null {
    if (!raw || typeof raw !== "object") {
        return null
    }
    const r = raw as Record<string, unknown>
    if (
        (r.filter === "weekly" || r.filter === "monthly") &&
        Array.isArray(r.data)
    ) {
        return r as unknown as CaloriesGraphResponse
    }
    const nested = r.data
    if (nested && typeof nested === "object") {
        const n = nested as Record<string, unknown>
        if (
            (n.filter === "weekly" || n.filter === "monthly") &&
            Array.isArray(n.data)
        ) {
            return n as unknown as CaloriesGraphResponse
        }
    }
    return null
}

const Home = () => {
    const dispatch = useDispatch()
    const user = useAppSelector(selectUser)
    const showCompleteProfileCard = user?.gender == null || user?.gender === ""
    const showConsultationSessionCards = hasPaidSubscriptionPlan(user)

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
    const {
        data: consultationSessionsRaw,
        refetch: refetchConsultationSessions,
    } = useGetConsultationSessionsQuery(undefined, {
        skip: !showConsultationSessionCards,
    });

    const consultationSessions = useMemo(() => {
        const root = consultationSessionsRaw as
            | { data?: { doctor?: { sessions_remaining?: number; sessions_limit?: number }; trainer?: { sessions_remaining?: number; sessions_limit?: number } } }
            | undefined
        return root?.data
    }, [consultationSessionsRaw])

    const dashboard = useMemo((): DashboardPayload => {
        const root = dashboardRaw as { data?: DashboardPayload } | undefined
        return root?.data ?? {}
    }, [dashboardRaw])

    const challengesCompleted = Number(dashboard.challenges_completed_count ?? 0)
    const workoutMinutes = Number(dashboard.workout_progress?.minutes ?? 0)
    const workoutPercentage = Math.min(
        100,
        Math.max(0, Number(dashboard.workout_progress?.percentage ?? 0)),
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
    const graphApiFilter =
        calorieFilter === "Monthly" ? "monthly" : "weekly"
    const {
        data: caloriesGraphRaw,
        isFetching: caloriesGraphFetching,
        refetch: refetchCaloriesGraph,
    } = useGetCaloriesGraphQuery(graphApiFilter)
    const calorieOptions = [
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' },
    ]
    const recommendedVideos = workoutData?.data || []

    const caloriesChartData = useMemo(() => {
        const payload = unwrapCaloriesGraphPayload(caloriesGraphRaw)
        const pts = payload?.data
        const emptyWeekly = {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
                {
                    data: [0, 0, 0, 0, 0, 0, 0],
                    color: (opacity = 1) => colors.primary,
                    strokeWidth: 0,
                },
            ],
        }
        if (!pts?.length) {
            return graphApiFilter === "weekly"
                ? emptyWeekly
                : {
                    labels: [""],
                    datasets: [
                        {
                            data: [0],
                            color: (opacity = 1) => colors.primary,
                            strokeWidth: 0,
                        },
                    ],
                }
        }
        if (graphApiFilter === "weekly") {
            const w = pts as WeeklyCaloriesDataPoint[]
            return {
                labels: w.map(p =>
                    p.day && p.day.length > 3 ? p.day.slice(0, 3) : (p.day ?? ""),
                ),
                datasets: [
                    {
                        data: w.map(p => Number(p.calories) || 0),
                        color: (opacity = 1) => colors.primary,
                        strokeWidth: 0,
                    },
                ],
            }
        }
        const m = pts as MonthlyCaloriesDataPoint[]
        return {
            /* Every other x-label (1, 3, 5…) — full `data` kept so the line stays accurate. */
            labels: m.map((p, i) => {
                const last = i === m.length - 1
                if (i % 2 !== 0 && !last) {
                    return ""
                }
                const d = p.date
                if (!d || d.length < 10) {
                    return d ?? ""
                }
                const dayOfMonth = parseInt(d.slice(8, 10), 10)
                return Number.isFinite(dayOfMonth) ? String(dayOfMonth) : ""
            }),
            datasets: [
                {
                    data: m.map(p => Number(p.calories) || 0),
                    color: (opacity = 1) => colors.primary,
                    strokeWidth: 0,
                },
            ],
        }
    }, [caloriesGraphRaw, graphApiFilter])

    /** Refetch dashboard when Home tab/screen is opened; refresh bell unread state too. */
    useFocusEffect(
        useCallback(() => {
            void (async () => {
                await refetchDashboard()
                if (showConsultationSessionCards) {
                    await refetchConsultationSessions()
                }
                dispatch(userApi.util.invalidateTags(["Notifications"]))
            })()
        }, [refetchDashboard, refetchConsultationSessions, showConsultationSessionCards, dispatch]),
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

    return (
        <Wrapper
            bottom_bar
            scrollable
            floating
            onScroll={onScrollRefetchDashboard}
            onRefresh={() => {
                void (async () => {
                    await Promise.allSettled([
                        refetch(),
                        refetchDashboard(),
                        refetchCaloriesGraph(),
                        ...(showConsultationSessionCards
                            ? [refetchConsultationSessions()]
                            : []),
                    ])
                    dispatch(userApi.util.invalidateTags(["Notifications"]))
                })()
            }}
            refreshing={
                (isFetching && !workoutLoading) ||
                (dashboardFetching && !dashboardLoading) ||
                caloriesGraphFetching
            }
        >
            <ProfileHeader />
            {showCompleteProfileCard ? (
                <View style={{ marginTop: heightPixel(30) }}>
                    <InfoCard />
                </View>
            ) : null}
            <View style={{ marginTop: heightPixel(30) }}>
                <HomeScreen />
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
                {showConsultationSessionCards ? (
                    <Row justify="space-between">
                        <View style={{ padding: heightPixel(8), width: "50%" }}>
                            <ConsultationSessionCard
                                title="Doctor Sessions"
                                remaining={Number(consultationSessions?.doctor?.sessions_remaining ?? 0)}
                                limit={Number(consultationSessions?.doctor?.sessions_limit ?? 0)}
                            />
                        </View>
                        <View style={{ padding: heightPixel(8), width: "50%" }}>
                            <ConsultationSessionCard
                                title="Trainer Sessions"
                                remaining={Number(consultationSessions?.trainer?.sessions_remaining ?? 0)}
                                limit={Number(consultationSessions?.trainer?.sessions_limit ?? 0)}
                            />
                        </View>
                    </Row>
                ) : null}
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
                        style={{
                            marginLeft: 0,
                            margin: 0,
                            paddingLeft: 0,
                            padding: 0,
                            /* Library uses this as left gutter for Y-axis labels (name is misleading). */
                            paddingRight: widthPixel(65),
                        }}
                        data={caloriesChartData}
                        width={vw * 100}
                        height={heightPixel(240)}
                        segments={4}
                        formatYLabel={y => {
                            const n = Number(String(y).replace(/,/g, ""))
                            return Number.isFinite(n)
                                ? String(Math.round(n))
                                : String(y)
                        }}
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
                                fontSize: font(11),
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