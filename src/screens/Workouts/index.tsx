import { FlatList, RefreshControl } from "react-native"
import VideoCard from "../../components/Cards/VideoCard"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import styles from "../../utils/styles"
import useWorkoutController from "./useWorkoutController"

const Workouts = () => {

    const { values, functions } = useWorkoutController()

    return (
        <Wrapper>
            <FlatList
                data={values?.data}
                renderItem={({ item }) => (
                    <VideoCard
                        {...item}
                        image={{ uri: item.image }}
                        onPress={() => functions.onPress(item.id, item.title)}
                    />
                )}
                ItemSeparatorComponent={() => <Seperator size={20} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponentStyle={styles.list_header_component}
                refreshControl={
                    <RefreshControl
                        refreshing={values.isLoading}
                        onRefresh={functions.onReload}
                    />
                }
            />
        </Wrapper>
    )
}

export default Workouts
