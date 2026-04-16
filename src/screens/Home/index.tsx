import { useState } from "react"
import { ScrollView, View } from "react-native"
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
import { useGetWorkoutQuery } from "../../redux/Apis/User"
import colors from "../../utils/colors"
import { PROGRESS_TRACKING } from "../../utils/data"
import { font, heightPixel, vw, widthPixel } from "../../utils/helper"
import { navigateToChallenges, navigateToWorkout, navigationRef } from '../../utils/navigation'
import { NAVIGATORS, ROUTES } from "../../utils/routes"

const Home = () => {
    const {
        data: workoutData,
        isLoading: workoutLoading,
        isFetching,
        refetch,
    } = useGetWorkoutQuery(undefined);
    const [calorieFilter, setCalorieFilter] = useState('Weekly')
    const calorieOptions = [
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' },
    ]
    const recommendedVideos = workoutData?.data || []

    const navigateToWorkoutDetails = (id: number) => {
        if (navigationRef.isReady()) {
            (navigationRef as any).navigate(NAVIGATORS.WORKOUT_STACK, {
                screen: ROUTES.WORKOUT_DETAILS,
                params: { id },
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
            onRefresh={() => void refetch()}
            refreshing={isFetching && !workoutLoading}
        >
            <ProfileHeader />
            <View style={{ marginTop: heightPixel(30) }}>
                <InfoCard />
            </View>
            <View style={{ marginTop: heightPixel(30) }}>
                <Row justify="space-between">
                    <View style={{ padding: heightPixel(8), width: "50%" }}>
                        <TrackingCard icon={images.steps_graph} title="Steps" progress={3000} subtext="Steps" />
                    </View>
                    <View style={{ padding: heightPixel(8), width: "50%" }}>
                        <TrackingCard title="Calories" progress={2800} subtext="Cal" type="progress" />
                    </View>
                </Row>
                <Row justify="space-between">
                    <Touchable style={{ padding: heightPixel(8), width: "50%" }} onPress={() => navigateToChallenges()}>
                        <TrackingCard icon={images.challenge_graph} title="Challenges" progress={10} subtext="Completed" />
                    </Touchable>
                    <View style={{ padding: heightPixel(8), width: "50%" }}>
                        <TrackingCard
                            title="Workout Progress"
                            progress={65 + '%'}
                            type="workout"
                            stats={[
                                { icon: images.cal, text: '15 Min' },
                                { icon: images.fire, text: '346 Kcal' },
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
                                image={item?.image}
                                video_count={item.video_count}
                                show_video_count
                                type="secondary"
                                is_video={true}
                                onPress={() => navigateToWorkoutDetails(item.id)}
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Row justify="space-between" align="center">
                    <Text weight="semibold" size={20}>Progress Tracking</Text>
                    <Text weight="semibold" size={20}>Level 09</Text>
                </Row>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                    {PROGRESS_TRACKING.map((item, index) => (
                        <View key={item?.title ?? index} style={{ marginRight: widthPixel(10) }}>
                            <ProgressCard {...item} />
                        </View>
                    ))}
                </ScrollView>
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
                                image={item?.image}
                                video_count={item.video_count}
                                show_video_count
                                type="secondary"
                                is_video={true}
                                onPress={() => navigateToWorkoutDetails(item.id)}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </Wrapper>
    )
}

export default Home