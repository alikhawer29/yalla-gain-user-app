import { FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import VideoCard from "../../components/Cards/VideoCard"
import DateFilterModal from "../../components/DateFilterModal"
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
            fromDate,
            toDate,
        },
        functions: {
            onReload,
            onWorkoutPress,
            onSearch,
            onFilterPress,
            onCloseFilterModal,
            onApplyFilter,
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
                        border={fromDate || toDate ? colors.primary : colors.white}
                        onPress={onFilterPress}
                    />
                </View>
            </Row>
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <VideoCard
                        {...item}
                        muscle_title={item.muscle_title}
                        exercise_title={item.exercise_title}
                        image={{ uri: item.image }}
                        onPress={() => onWorkoutPress(item.id)}
                        is_video={false}
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
            />

            <DateFilterModal
                visible={showFilterModal}
                onClose={onCloseFilterModal}
                onApply={onApplyFilter}
                initialFromDate={fromDate}
                initialToDate={toDate}
            />
        </Wrapper>
    )
}

export default Workouts
