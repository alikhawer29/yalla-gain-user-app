import { FlatList, View } from "react-native"
import CreatePostCard from "../../components/Cards/CreatePostCard"
import NewsFeedCard from "../../components/Cards/NewsFeedCard"
import Wrapper from "../../components/Wrapper"
import { NEWSFEED } from "../../utils/data"
import { BOTTOMBAR_HEIGHT, heightPixel } from "../../utils/helper"

const NewsFeed = () => {
    return (
        <Wrapper>
            <FlatList
                data={NEWSFEED}
                renderItem={({ item }) => <NewsFeedCard {...item} />}
                ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => <CreatePostCard />}
                ListHeaderComponentStyle={{ marginBottom: heightPixel(10) }}
                contentContainerStyle={{ paddingBottom: heightPixel(90) + BOTTOMBAR_HEIGHT }}
            />
        </Wrapper>
    )
}

export default NewsFeed