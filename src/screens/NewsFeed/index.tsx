import { FlatList, View } from "react-native"
import CreatePostCard from "../../components/Cards/CreatePostCard"
import NewsFeedCard from "../../components/Cards/NewsFeedCard"
import Wrapper from "../../components/Wrapper"
import { NEWSFEED } from "../../utils/data"
import { heightPixel } from "../../utils/helper"

const NewsFeed = () => {
    return (
        <Wrapper bottom_bar floating scrollable>
            <FlatList
                data={NEWSFEED}
                renderItem={({ item }) => <NewsFeedCard {...item} />}
                ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => <CreatePostCard />}
                ListHeaderComponentStyle={{ marginBottom: heightPixel(10) }}
            />
        </Wrapper>
    )
}

export default NewsFeed