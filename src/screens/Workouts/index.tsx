import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import VideoCard from "../../components/Cards/VideoCard"
import Empty from "../../components/Empty"
import WorkoutFilterModal from "../../components/WorkoutFilterModal"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import globalStyles from "../../utils/styles"
import useWorkoutController from "./useWorkoutController"

const Workouts = () => {

    const {
        values: {
            isLoading,
            data,
            search,
            showFilterModal,
            muscleId,
            muscles,
            musclesLoading,
        },
        functions: {
            onReload,
            onWorkoutPress,
            onSearch,
            onFilterPress,
            onCloseFilterModal,
            onApplyMuscleFilter,
        }
    } = useWorkoutController()

    return (
        <Wrapper>
            <Row style={{ marginBottom: heightPixel(15) }} align="center" gap={10}>
                <View style={{ width: "85%" }}>
                    <Input
                        placeholder="Search Workouts"
                        height={40}
                        icon={images.search}
                        value={search}
                        onChangeText={onSearch}
                    />
                </View>
                <View style={{ width: "15%" }}>
                    <Icon
                        source={images.filters}
                        size={40}
                        rounded
                        less_rounded
                        border={muscleId != null ? colors.primary : colors.white}
                        onPress={onFilterPress}
                    />
                </View>
            </Row>
            <FlatList
                data={data}
                contentContainerStyle={data.length === 0 ? { flexGrow: 1 } : undefined}
                renderItem={({ item }) => (
                    <VideoCard
                        {...item}
                        muscle_title={item.muscle_title}
                        exercise_title={item.exercise_title}
                        description={item.description}
                        image={{ uri: item.image }}
                        onPress={() => onWorkoutPress(item)}
                        is_video={false}
                        show_video_count
                        video_count={item.video_count}
                        use_muscle_title
                    />
                )}
                ItemSeparatorComponent={() => <Seperator size={20} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponentStyle={globalStyles.list_header_component}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onReload}
                    />
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View style={{ paddingVertical: heightPixel(40), alignItems: "center" }}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <Empty message="No workouts found" />
                    )
                }
            />

            <WorkoutFilterModal
                visible={showFilterModal}
                onClose={onCloseFilterModal}
                onApply={onApplyMuscleFilter}
                initialMuscleId={muscleId}
                muscles={muscles}
                musclesLoading={musclesLoading}
            />
        </Wrapper>
    )
}

export default Workouts
