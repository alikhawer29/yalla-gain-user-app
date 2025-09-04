import React from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    View
} from "react-native";
import fonts from "../../assets/fonts";
import images from "../../assets/images";
import ChatItemCard from "../../components/Cards/ChatItemCard";
import Icon from "../../components/Icon";
import Seperator from "../../components/Seperator";
import Wrapper from "../../components/Wrapper";
import useKeyboard from "../../hooks/useKeyboard";
import colors from "../../utils/colors";
import { heightPixel } from "../../utils/helper";
import useChatbotController from "./useChatbotController";

const Chatbot = () => {

    const {
        refs: {
            flatlist_ref
        },
        values: {
            data,
            input
        },
        functions: {
            onChangeInput,
            onSendMessage
        }
    } = useChatbotController()

    const keyboardHeight = useKeyboard()
    const isNewAndroid = Platform.OS === "android" && Platform.Version >= 35;

    const renderItem = ({ item }) => (
        <ChatItemCard
            message={item?.text}
            sender={item.sender === "me"}
            created_at={item?.timestamp}
            typing={item?.typing}
            image={item.sender === "me" ? images.dummy : images.chatbot}
        />
    )

    return (
        <Wrapper>
            <KeyboardAvoidingView
                style={[styles.container, {
                    marginBottom: isNewAndroid ? keyboardHeight : 0
                }]}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <FlatList
                    ref={flatlist_ref}
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={<Seperator />}
                />
                <View style={styles.input_container}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={input}
                        onChangeText={onChangeInput}
                        placeholderTextColor={colors.icon_gray}
                    />
                    <Icon rounded color={colors.primary} onPress={onSendMessage} source={images.send} size={50} />
                </View>
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    input_container: {
        flexDirection: "row",
        backgroundColor: colors.transparent,
        gap: 10,
        paddingVertical: heightPixel(30),
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: heightPixel(10),
        paddingHorizontal: 15,
        backgroundColor: colors.blackish_gray,
        color: colors.white,
        height: heightPixel(50),
        fontFamily: fonts.sfpro.regular
    }
});

export default Chatbot;
