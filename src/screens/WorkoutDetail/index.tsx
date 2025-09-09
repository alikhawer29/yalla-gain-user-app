import { FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import VideoCard from "../../components/Cards/VideoCard"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
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
            search
        },
        functions: {
            onSave,
            onPress,
            onReload,
            onSearch
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
                    <Icon source={images.filters} size={40} rounded less_rounded border={colors.white} />
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
        </Wrapper>
    )
}

export default WorkoutDetail