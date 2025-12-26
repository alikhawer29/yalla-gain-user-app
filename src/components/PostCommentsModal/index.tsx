import { FC, useState } from "react";
import { Modal, View, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import Row from "../Row";
import Icon from "../Icon";
import Text from "../Text";
import images from "../../assets/images";
import colors from "../../utils/colors";
import { heightPixel, widthPixel, font } from "../../utils/helper";

interface IPostCommentsModal {
    visible: boolean;
    onClose: () => void;
    post_id?: string | number;
    comment_count: number;
}

const PostCommentsModal: FC<IPostCommentsModal> = ({ visible, onClose, post_id, comment_count }) => {
    const [commentText, setCommentText] = useState("");

    // Mock data - replace with actual API call
    const comments = [
        {
            id: 1,
            user: { first_name: "Marvel", last_name: "Edward", image: images.dummy },
            comment: "It is a long established fact that a reader will be distracted by the readable content of a page",
            reaction_count: "1.25k",
            created_at: "2 days ago"
        },
        {
            id: 2,
            user: { first_name: "Medvin", last_name: "Hardy", image: images.dummy },
            comment: "It is a long established fact that a reader will be distracted by the readable content of a page",
            reaction_count: "1.25k",
            created_at: "2 days ago"
        },
        {
            id: 3,
            user: { first_name: "Juliana", last_name: "John", image: images.dummy },
            comment: "It is a long established fact that a reader will be distracted by the readable content of a page",
            reaction_count: "1.25k",
            created_at: "2 days ago"
        },
        {
            id: 4,
            user: { first_name: "Roy", last_name: "David", image: images.dummy },
            comment: "It is a long established fact that a reader will be distracted by the readable content of a page",
            reaction_count: "1.25k",
            created_at: "2 days ago"
        },
        {
            id: 5,
            user: { first_name: "Khawer", last_name: "David", image: images.dummy },
            comment: "It is a long established fact that a reader will be distracted by the readable content of a page",
            reaction_count: "1.25k",
            created_at: "2 days ago"
        },
    ];

    const handleSendComment = () => {
        if (commentText.trim()) {
            // TODO: Send comment to API
            console.log("Sending comment:", commentText);
            setCommentText("");
        }
    };

    const renderCommentItem = ({ item }: { item: any }) => (
        <View style={{
            paddingVertical: heightPixel(15),
            borderBottomWidth: 1,
            borderBottomColor: colors.dark_gray,
        }}>
            <Row align="flex-start" gap={12}>
                <Icon
                    source={item.user?.image || images.dummy}
                    size={45}
                    rounded
                    no_padding
                    border={colors.white}
                    resize="cover"
                />
                <View style={{ flex: 1 }}>
                    <Row justify="space-between" align="center" style={{ marginBottom: heightPixel(5) }}>
                        <Text weight="semibold" size={15}>
                            {item.user?.first_name} {item.user?.last_name}
                        </Text>
                        <TouchableOpacity>
                            <Icon source={images.dots} size={15} tint_color={colors.white} />
                        </TouchableOpacity>
                    </Row>

                    <Text size={13} color={colors.icon_gray} style={{ lineHeight: 20 }}>
                        {item.comment}
                    </Text>

                    <Row align="center" gap={4} style={{ marginTop: heightPixel(8) }}>
                        {/* Using peace/victory hand sign if available, else heart/like. 
                            The image showed a V sign. Using 'like' as placeholder for V sign if specific asset missing. */}
                        <Icon source={images.like} size={14} tint_color={colors.primary} />
                        <Text size={12} color={colors.icon_gray}>
                            {item.reaction_count}
                        </Text>
                    </Row>
                </View>
            </Row>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end',
                }}
                activeOpacity={1}
                onPress={onClose}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            backgroundColor: colors.blackish_gray,
                            borderTopLeftRadius: heightPixel(20),
                            borderTopRightRadius: heightPixel(20),
                            height: '90%', // Increased height to match design
                            marginTop: heightPixel(90),
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View style={{
                            paddingHorizontal: widthPixel(20),
                            paddingVertical: heightPixel(20),
                            borderBottomWidth: 1,
                            borderBottomColor: colors.dark_gray,
                        }}>
                            <Row align="center" gap={15}>
                                <TouchableOpacity onPress={onClose}>
                                    <Icon source={images.back} size={20} tint_color={colors.white} />
                                </TouchableOpacity>
                                <Row align="center" gap={8}>
                                    {/* Matches the 'V 200' style in image */}
                                    <Icon source={images.like} size={20} tint_color={colors.primary} />
                                    <Text weight="semibold" size={16}>
                                        {comment_count || comments.length}
                                    </Text>
                                </Row>
                            </Row>
                        </View>

                        {/* List of comments */}
                        <FlatList
                            data={comments}
                            renderItem={renderCommentItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{
                                paddingHorizontal: widthPixel(20),
                                paddingBottom: heightPixel(20)
                            }}
                            showsVerticalScrollIndicator={true}
                        />

                        {/* Comment Input */}
                        <View style={{
                            paddingHorizontal: widthPixel(20),
                            paddingVertical: heightPixel(15),
                            borderTopWidth: 1,
                            borderTopColor: colors.dark_gray,
                            backgroundColor: colors.blackish_gray,
                        }}>
                            <Row align="center" gap={12}>
                                <View style={{
                                    flex: 1,
                                    backgroundColor: colors.blackish_gray,
                                    borderRadius: heightPixel(10), // More squared as per image
                                    paddingHorizontal: widthPixel(15),
                                    paddingVertical: heightPixel(12),
                                    borderWidth: 1,
                                    borderColor: colors.dark_gray
                                }}>
                                    <TextInput
                                        style={{
                                            color: colors.white,
                                            fontSize: font(14),
                                            padding: 0,
                                        }}
                                        placeholder="Write Comment"
                                        placeholderTextColor={colors.white} // Brighter placeholder
                                        value={commentText}
                                        onChangeText={setCommentText}
                                        multiline
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleSendComment}
                                    style={{
                                        width: 45,
                                        height: 45,
                                        borderRadius: 25,
                                        backgroundColor: colors.primary,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Icon source={images.send} size={20} tint_color={colors.white} />
                                </TouchableOpacity>
                            </Row>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </TouchableOpacity>
        </Modal>
    );
};

export default PostCommentsModal;

