import { FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import VideoCard from "../../components/Cards/VideoCard"
import DateFilterModal from "../../components/DateFilterModal"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Text from "../../components/Text"
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
            fromDate,
            toDate,
        },
        functions: {
            onSave,
            onPress,
            onReload,
            onSearch,
            onFilterPress,
            onCloseFilterModal,
            onApplyFilter
        }
    } = useWorkoutDetailController()

    // console.log(data[0]?.exercise_key, 'data')


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
                        <Icon source={images.filters} size={40} rounded less_rounded border={(fromDate || toDate) ? colors.primary : colors.white} />
                    </Touchable>
                </View>
            </Row>
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <VideoCard
                        {...item}
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
            />

            {/* Date Filter Modal */}
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

export default WorkoutDetail