import { FlatList, RefreshControl } from "react-native"
import VideoCard from "../../components/Cards/VideoCard"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import styles from "../../utils/styles"
import useWorkoutDetailController from "./useWorkoutDetailController"

const WorkoutDetail = () => {

    const { values, functions } = useWorkoutDetailController()

    return (
        <Wrapper>
            <FlatList
                data={values?.data}
                renderItem={({ item }) => (
                    <VideoCard
                        {...item}
                        image={{ uri: item.thumbnail }}
                        onSave={() => functions.onSave(item.id)}
                        onPress={() => functions.onPress(item.id)}
                    />
                )}
                ItemSeparatorComponent={() => <Seperator size={20} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponentStyle={styles.list_header_component}
                refreshControl={
                    <RefreshControl
                        refreshing={values.isLoading}
                        onRefresh={functions.onReload}
                    />}
            />
        </Wrapper>
    )
}

export default WorkoutDetail