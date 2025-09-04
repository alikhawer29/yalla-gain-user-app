import { FlatList, RefreshControl } from "react-native"
import VideoCard from "../../components/Cards/VideoCard"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import styles from "../../utils/styles"
import useSavedContentController from "./useSavedContentController"

const SavedContent = () => {

    const {
        values: {
            data,
            isLoading
        },
        functions: {
            onReload,
            onSave,
            onPress
        }
    } = useSavedContentController()

    return (
        <Wrapper>
            <FlatList
                data={data}
                renderItem={({ item }) => <VideoCard {...item} image={{ uri: item.thumbnail }} onSave={() => onSave(item.id)}
                    onPress={() => onPress(item.id)}
                />}
                ItemSeparatorComponent={() => <Seperator size={20} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponentStyle={styles.list_header_component}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onReload} />}
            />
        </Wrapper>
    )
}

export default SavedContent