import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import VideoCard from "../../components/Cards/VideoCard"
import Empty from "../../components/Empty"
import ExerciseTypeFilterModal from "../../components/ExerciseTypeFilterModal"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Touchable from "../../components/Touchable"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import globalStyles from "../../utils/styles"
import useWorkoutDetailController from "./useWorkoutDetailController"

const WorkoutDetail = () => {

    const {
        values: {
            data,
            isLoading,
            search,
            showFilterModal,
            exerciseId,
            exerciseTypes,
            exerciseTypesLoading,
        },
        functions: {
            onSave,
            onPress,
            onReload,
            onSearch,
            onFilterPress,
            onCloseFilterModal,
            onApplyExerciseFilter
        }
    } = useWorkoutDetailController()

    return (
        <Wrapper>
            <Row style={{ marginBottom: heightPixel(15) }} align="center" gap={10}>
                <View style={{ width: "85%" }}>
                    <Input
                        placeholder="Search Videos"
                        height={40}
                        icon={images.search}
                        value={search}
                        onChangeText={onSearch}
                    />
                </View>
                <View style={{ width: "15%" }}>
                    <Touchable onPress={onFilterPress}>
                        <Icon
                            source={images.filters}
                            size={40}
                            rounded
                            less_rounded
                            border={exerciseId != null ? colors.primary : colors.white}
                        />
                    </Touchable>
                </View>
            </Row>
            <FlatList
                data={data}
                contentContainerStyle={data.length === 0 ? { flexGrow: 1 } : undefined}
                renderItem={({ item }) => (
                    <VideoCard
                        {...item}
                        exercise_title={item.exercise?.text}
                        image={{ uri: item.thumbnail }}
                        onSave={() => onSave(item.id)}
                        onPress={() => onPress(item.id)}
                    />
                )}
                ItemSeparatorComponent={() => <Seperator size={20} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponentStyle={globalStyles.list_header_component}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onReload}
                    />}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={{ paddingVertical: heightPixel(40), alignItems: "center" }}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <Empty message="No videos found" />
                    )
                }
            />

            <ExerciseTypeFilterModal
                visible={showFilterModal}
                onClose={onCloseFilterModal}
                onApply={onApplyExerciseFilter}
                initialExerciseId={exerciseId}
                exerciseTypes={exerciseTypes}
                loading={exerciseTypesLoading}
            />
        </Wrapper>
    )
}

export default WorkoutDetail
