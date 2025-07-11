import { useState } from "react"
import Tabs from "../../components/Tabs"
import Wrapper from "../../components/Wrapper"
import { CHATS } from "../../utils/data"
import { FlatList, View } from "react-native"
import ChatCard from "../../components/Cards/ChatCard"
import { heightPixel } from "../../utils/helper"

const Chat = () => {

    const [selected, setSelected] = useState<string>("user")

    return (
        <Wrapper>
            <FlatList
                data={CHATS}
                renderItem={({ item }) => <ChatCard {...item} />}
                ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => <Tabs tabs={[{ label: "User", value: "user" }, { label: "Trainer", value: "trainer" }, { label: "Doctor", value: "doctor" }]} selected={selected} setSelected={setSelected} />}
                ListHeaderComponentStyle={{ marginBottom: heightPixel(10) }}
            />
        </Wrapper>
    )
}

export default Chat