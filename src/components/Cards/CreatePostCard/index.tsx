import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import colors from "../../../utils/colors";
import { CREATE_POST_OPTIONS } from "../../../utils/data";
import { heightPixel } from "../../../utils/helper";
import Badge from "../../Badge";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Input from "../../Input";
import Row from "../../Row";

const CreatePostCard: FC = () => {
    return (
        <CardWrapper padding={18} height={"auto"} color={colors.blackish_gray}>
            <Row gap={12} align="center">
                <View style={{ flex: 0.15 }}>
                    <Icon source={images.dummy} size={50} />
                </View>
                <View style={{ flex: 0.85 }}>
                    <Input placeholder="What's on your mind?" type="textarea" height={45} mode="secondary" />
                </View>
            </Row>
            <Row justify="space-evenly" style={{ marginTop: heightPixel(18 - 7.5) }}>
                {
                    CREATE_POST_OPTIONS.map((item, index) => (
                        <Badge key={index} title={item.title} icon={item.icon} />
                    ))
                }
            </Row>
        </CardWrapper>
    )
}

export default memo(CreatePostCard)