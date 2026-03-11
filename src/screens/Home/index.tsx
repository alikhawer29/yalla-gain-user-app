import { FlatList, View } from "react-native"
import { LineChart } from "react-native-chart-kit"
import fonts from "../../assets/fonts"
import images from "../../assets/images"
import InfoCard from "../../components/Cards/InfoCard"
import ProgressCard from "../../components/Cards/ProgressCard"
import TrackingCard from "../../components/Cards/TrackingCard"
import VideoCard from "../../components/Cards/VideoCard"
import WorkoutCard from "../../components/Cards/WorkoutCard"
import ProfileHeader from "../../components/ProfileHeader"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { PROGRESS_TRACKING, WORKOUT_PLANS, RECOMMENDED_VIDEOS } from "../../utils/data"
import { useGetWorkoutQuery } from "../../redux/Apis/User"
import { font, heightPixel, vw, widthPixel } from "../../utils/helper"
import { navigate, navigationRef } from "../../utils/navigation"
import { ROUTES, NAVIGATORS } from "../../utils/routes"

const Home = () => {
    const { data: workoutData, isLoading: workoutLoading } = useGetWorkoutQuery(undefined);
    const recommendedVideos = workoutData?.data || []

    const navigateToWorkoutDetails = (id: number) => {
        if (navigationRef.isReady()) {
            (navigationRef as any).navigate(NAVIGATORS.WORKOUT_STACK, {
                screen: ROUTES.WORKOUT_DETAILS,
                params: { id },
            });
        }
    };

    const getRecommendedImage = (index: number) => RECOMMENDED_VIDEOS[index % RECOMMENDED_VIDEOS.length]?.image;
    const getWorkoutPlanImage = (index: number) => WORKOUT_PLANS[index % WORKOUT_PLANS.length]?.image;

    const data = {
        labels: ["Mon", "Tues", "Wed", "Thu", "Fri"],
        datasets: [
            {
                data: [50, 95, 20, 50, 20],
                color: (opacity = 1) => colors.primary, // optional
                strokeWidth: 0 // optional
            }
        ],
    };

    return (
        <Wrapper bottom_bar scrollable floating>
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
                        <TrackingCard icon={images.steps_graph} title="Steps" progress={3000} subtext="Steps" />
                    </View>
                </Row>
                <Row justify="space-between">
                    <Touchable style={{ padding: heightPixel(8), width: "50%" }} onPress={() => navigate('Challenges')}>
                        <TrackingCard icon={images.challenge_graph} title="Challenges" progress={10} subtext="Completed" />
                    </Touchable>
                    <View style={{ padding: heightPixel(8), width: "50%" }}>
                        <TrackingCard icon={images.steps_graph} title="Steps" progress={3000} subtext="Steps" />
                    </View>
                </Row>
            </View>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Text weight="semibold" size={20}>Recommended Videos</Text>
                <FlatList
                    horizontal
                    data={recommendedVideos}
                    renderItem={({ item, index }) => (
                        <VideoCard
                            title={item.title}
                            description={item.description}
                            created_at={item.created_at}
                            image={getRecommendedImage(index)}
                            type="secondary"
                            is_video={true}
                            onPress={() => navigateToWorkoutDetails(item.id)}
                        />
                    )}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ width: widthPixel(10) }} />}
                />
            </View>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Text weight="semibold" size={20}>Progress Tracking</Text>
                <FlatList
                    horizontal
                    data={PROGRESS_TRACKING}
                    renderItem={({ item }) => <ProgressCard {...item} />}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ width: widthPixel(10) }} />}
                />
            </View>
            <View style={{ marginTop: heightPixel(30), width: "100%", gap: heightPixel(15) }}>
                <Text weight="semibold" size={20}>Calories</Text>
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
                <Text weight="semibold" size={20}>Workout Plans</Text>
                <FlatList
                    data={recommendedVideos}
                    renderItem={({ item, index }) => (
                        <VideoCard
                            title={item.title}
                            description={item.description}
                            created_at={item.created_at}
                            image={getWorkoutPlanImage(index)}
                            type="secondary"
                            is_video={true}
                            onPress={() => navigateToWorkoutDetails(item.id)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
                />
            </View>
        </Wrapper>
    )
}

export default Home