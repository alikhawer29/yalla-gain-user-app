import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    View
} from "react-native";
import { useSelector } from "react-redux";
import fonts from "../../assets/fonts";
import images from "../../assets/images";
import ChatItemCard from "../../components/Cards/ChatItemCard";
import Empty from "../../components/Empty";
import Icon from "../../components/Icon";
import Wrapper from "../../components/Wrapper";
import { useCreateConversationMutation, useEndSessionMutation, useSendQuestionMutation } from "../../redux/Apis/Chatbot";
import { selectUser } from "../../redux/Slices/AuthSlice";
import colors from "../../utils/colors";
import { heightPixel } from "../../utils/helper";
import Text from "../../components/Text";
import Loader from "../../components/Loader";

const Chatbot = () => {

    const flatlist_ref = useRef(null);
    const user = useSelector(selectUser);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const [createConversation, { data: createConversationData }] = useCreateConversationMutation();
    const [send, { data: sendData, isLoading: isSendLoading, isSuccess: isSendSuccess }] = useSendQuestionMutation();
    const [endSession] = useEndSessionMutation();

    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setKeyboardVisible] = useState(true);

    useEffect(() => {
        if (flatlist_ref.current) {
            flatlist_ref.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            e => {
                setKeyboardHeight(e.endCoordinates.height);
            },
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            },
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true); // Keyboard is open
            },
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false); // Keyboard is closed
            },
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        // return () => {
        //     endSession({
        //         session_id: createConversationData?.session_id,
        //         visitor_id: user?.id
        //     })
        // }
    }, [])

    useEffect(() => {
        if (user && user.id) {
            createConversation({ visitor_id: user.id });
        }
    }, [user]);

    useEffect(() => {
        if (isSendSuccess) {
            const newMessage = {
                id: Date.now().toString(),
                text: sendData,
                sender: "other",
                time: new Date()
            };
            setMessages((prev) => [...prev, newMessage]);
        }
    }, [isSendSuccess, sendData]);

    const sendMessage = () => {
        if (input.trim() === "") return;
        const newMessage = {
            id: Date.now().toString(),
            text: input,
            sender: "me",
            time: new Date()
        };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        handleStream(newMessage.text);
    };

    const handleStream = async (question) => {
        send({ session_id: createConversationData?.session_id, question });
    };

    const renderItem = ({ item }) => {
        const isMe = item.sender === "me";
        return (
            <ChatItemCard message={item?.text} sender={isMe} created_at={item?.toString()} image="https://i.pravatar.cc/150?img=5" />
        );
    };

    return (
        <Wrapper>
            <KeyboardAvoidingView
                style={[styles.container, { marginBottom: isKeyboardVisible ? keyboardHeight : 0 }]}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <FlatList
                    ref={flatlist_ref}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    style={styles.chatList}
                    // contentContainerStyle={{ paddingVertical: 10 }}
                    ListEmptyComponent={<Empty message="Start Conversation" />}
                />
                {
                    isSendLoading &&
                    <View>
                        <Loader />
                    </View>
                }
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={input}
                        onChangeText={setInput}
                        placeholderTextColor={colors.icon_gray}
                    />
                    <Icon rounded color={colors.primary} onPress={sendMessage} source={images.send} size={50} />
                </View>
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    chatList: { flex: 1, paddingHorizontal: 10 },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginVertical: 5
    },
    rowReverse: {
        flexDirection: "row-reverse"
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginHorizontal: 5
    },
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        maxWidth: "75%"
    },
    myMessage: {
        backgroundColor: colors.blackish_gray,
        borderTopRightRadius: 0
    },
    otherMessage: {
        backgroundColor: colors.blackish_gray,
        borderTopLeftRadius: 0
    },
    messageText: { color: "#fff" },
    timeText: {
        fontSize: 10,
        color: "#999",
        marginTop: 2
    },
    inputContainer: {
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
    },
    sendButton: {
        backgroundColor: "#6A24C6",
        paddingHorizontal: 20,
        justifyContent: "center",
        borderRadius: 20,
        marginLeft: 10
    }
});

export default Chatbot;
