import { useState, useCallback } from "react";
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from "@react-navigation/native";
import { goBack } from "../../utils/navigation";
import { useModal } from "../../contexts/ModalContext";
import { useAppSelector } from "../../hooks";
import { selectUser } from "../../redux/Slices/AuthSlice";

const useCreatePostController = (initialTab?: 'photo' | 'video' | 'poll') => {
    const navigation = useNavigation();
    const { showOkModal } = useModal();

    const user = useAppSelector(selectUser)
    
    const [content, setContent] = useState("");
    const [media, setMedia] = useState<any[]>([]);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState([{ id: 1, text: "" }, { id: 2, text: "" }]);
    const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'video' | 'poll'>(initialTab || 'text');

    const handlePickMedia = useCallback(async (type: 'photo' | 'video') => {
        const options: any = {
            mediaType: type,
            selectionLimit: 0, // 0 means unlimited
        };

        const result = await launchImageLibrary(options);

        if (result.assets) {
            const newMedia = result.assets.map(asset => ({
                type: type,
                source: { uri: asset.uri },
                original: asset
            }));
            setMedia(prev => [...prev, ...newMedia]);
        }
    }, []);

    const removeMedia = useCallback((index: number) => {
        setMedia(prev => prev.filter((_, i) => i !== index));
    }, []);

    const addPollOption = useCallback(() => {
        setPollOptions(prev => [...prev, { id: prev.length + 1, text: "" }]);
    }, []);

    const removePollOption = useCallback((id: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(prev => prev.filter(opt => opt.id !== id));
        }
    }, [pollOptions.length]);

    const updatePollOption = useCallback((id: number, text: string) => {
        setPollOptions(prev => prev.map(opt => opt.id === id ? { ...opt, text } : opt));
    }, []);

    const handlePost = useCallback(() => {
        // Mock API call simulation
        showOkModal({
            type: "success",
            title: "Successfully",
            message: "Post Has Been Created Successfully"
        }, () => {
             goBack();
        });
    }, [showOkModal]);
    
    // Auto trigger picker if initialTab is photo or video (Optional, but user might expect UI to open)
    // For now we just set the tab.

    return {
        values: {
            user,
            user_image: user?.photo,
            content,
            media,
            pollQuestion,
            pollOptions,
            activeTab
        },
        functions: {
            setContent,
            setPollQuestion,
            setActiveTab,
            handlePickMedia,
            removeMedia,
            addPollOption,
            removePollOption,
            updatePollOption,
            handlePost,
            goBack
        }
    }
}

export default useCreatePostController;
