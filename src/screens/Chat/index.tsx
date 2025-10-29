import { useState } from "react"
import { FlatList, View } from "react-native"
import images from "../../assets/images"
import ChatCard from "../../components/Cards/ChatCard"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Tabs from "../../components/Tabs"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { CHAT_TYPES, CHATS } from "../../utils/data"
import styles from "./style"

const Chat = () => {

    const [selected, setSelected] = useState<string | number>(CHAT_TYPES[0].value)

    const renderHeader = () => (
        <View style={styles.header_container}>
            <Row align="center" justify="space-between">
                <View style={styles.search_container}>
                    <Input placeholder="Search Chat" icon={images.search} height={40} />
                </View>
                <View style={styles.filter_container}>
                    <Icon source={images.filters} border={colors.white} size={40} rounded less_rounded />
                </View>
            </Row>
            <Tabs tabs={CHAT_TYPES} selected={selected} setSelected={setSelected} />
        </View>
    )

    return (
        <Wrapper bottom_bar scrollable floating>
            <FlatList
                data={CHATS}
                renderItem={({ item }) => <ChatCard {...item} />}
                ItemSeparatorComponent={() => <Seperator size={15} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                ListHeaderComponentStyle={styles.list_header}
            />
        </Wrapper>
    )
}

export default Chat