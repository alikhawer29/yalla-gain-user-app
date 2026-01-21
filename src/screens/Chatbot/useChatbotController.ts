import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useSelector } from "react-redux";
import { useCreateConversationMutation, useEndSessionMutation, useSendQuestionMutation } from "../../redux/Apis/Chatbot";
import { selectUser } from "../../redux/Slices/AuthSlice";
import { TMessage } from "../../interfaces";

const INITIAL_MESSAGE = {
    id: '1',
    text: "Hi there! 👋 Yalla AI is here. How can I help you today?",
    sender: 'bot',
    timestamp: null,
}

const useChatbotController = () => {

    const flatlist_ref = useRef<FlatList>(null)
    const user = useSelector(selectUser)

    const [createConversation, { data: createConversationData }] = useCreateConversationMutation();
    const [send, { data: sendData, isLoading: isSendLoading, isSuccess: isSendSuccess }] = useSendQuestionMutation();
    const [endSession] = useEndSessionMutation();

    const [messages, setMessages] = useState<TMessage[]>([INITIAL_MESSAGE])
    const [input, setInput] = useState("")

    useEffect(() => {
        if (flatlist_ref.current) {
            flatlist_ref.current.scrollToEnd({ animated: true });
        }
    }, [messages])

    useEffect(() => {
        if (user && user.id) {
            createConversation({ visitor_id: user.id });
        }
    }, [user])

    useEffect(() => {

        if (isSendSuccess) {

            const new_message = {
                id: Date.now().toString(),
                text: sendData,
                sender: "bot",
                timestamp: new Date()
            }

            let temp = [...messages]
            temp.pop()
            temp.push(new_message)

            setMessages(temp)

        }

    }, [isSendSuccess, sendData])

    useEffect(() => {
        if (isSendLoading) {

            const new_message = {
                id: Date.now().toString(),
                sender: "bot",
                timestamp: null,
                typing: true,
                text: ""
            }

            setTimeout(() => {
                setMessages((prev) => [...prev, new_message])
            }, 500)

        }
    }, [isSendLoading])

    const onSendMessage = () => {

        if (input.trim() === "") return;

        const new_message = {
            id: Date.now().toString(),
            text: input,
            sender: "me",
            timestamp: new Date()
        }

        setMessages((prev) => [...prev, new_message])
        setInput("")

        send({ session_id: createConversationData?.session_id, question: new_message.text });

    }

    // useEffect(() => {
    //     return () => {
    //         if (createConversationData?.session_id && user) {
    //             endSession({ session_id: createConversationData.session_id, visitor_id: user.id });
    //         }
    //     }
    // }, []);

    return {
        refs: {
            flatlist_ref
        },
        values: {
            data: messages,
            input
        },
        functions: {
            onSendMessage,
            onChangeInput: setInput
        }
    }

}

export default useChatbotController 
