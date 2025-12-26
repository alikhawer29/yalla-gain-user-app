import { FC, memo } from "react";
import { View, TouchableOpacity } from "react-native";
import images from "../../../assets/images";
import colors from "../../../utils/colors";
import { CREATE_POST_OPTIONS } from "../../../utils/data";
import { heightPixel } from "../../../utils/helper";
import Badge from "../../Badge";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Input from "../../Input";
import Row from "../../Row";

import { navigate } from "../../../utils/navigation";

const CreatePostCard: FC = () => {
    return (
        <CardWrapper padding={18} height={"auto"} color={colors.blackish_gray}>
            <Row gap={12} align="center">
                <View style={{ flex: 0.15 }}>
                    <Icon source={images.dummy} size={50} />
                </View>
                <View style={{ flex: 0.85 }}>
                    <TouchableOpacity onPress={() => navigate('CreatePost')} activeOpacity={0.8} style={{ width: '100%' }}>
                        <Input placeholder="What's on your mind?" type="textarea" height={45} mode="secondary" disabled />
                    </TouchableOpacity>
                </View>
            </Row>
            <Row justify="space-evenly" style={{ marginTop: heightPixel(18 - 7.5) }}>
                {
                    CREATE_POST_OPTIONS.map((item, index) => (
                        <Badge
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            onPress={() => navigate('CreatePost', { initialTab: (item.title === 'Polling' ? 'poll' : item.title.toLowerCase()) as any })}
                        />
                    ))
                }
            </Row>
        </CardWrapper>
    )
}

export default memo(CreatePostCard)