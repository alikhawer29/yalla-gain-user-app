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
import useSavedContentController from "./useSavedContentController"

const SavedContent = () => {

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
            onReload,
            onSave,
            onPress,
            onSearch,
            onFilterPress,
            onCloseFilterModal,
            onApplyFilter,
        }
    } = useSavedContentController()

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
                renderItem={({ item }) => <VideoCard {...item} image={{ uri: item.thumbnail }} onSave={() => onSave(item.id)}
                    onPress={() => onPress(item.id)}
                />}
                ItemSeparatorComponent={() => <Seperator size={20} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponentStyle={globalStyles.list_header_component}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onReload} />}
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

export default SavedContent