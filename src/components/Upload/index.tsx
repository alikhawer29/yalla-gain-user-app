import { FC, memo } from "react";
import { Pressable } from "react-native";
import images from "../../assets/images";
import { IUpload } from "../../interfaces";
import Icon from "../Icon";
import Row from "../Row";
import Text from "../Text";
import colors from "../../utils/colors";

const Upload: FC<IUpload> = ({ text = "Upload", style, required, onPress }) => {
    const content = (
        <Row align="center" gap={10} style={style}>
            <Icon source={images.upload} size={24} />
            <Text size={16} weight="semibold">{text}{required ? " " : ""}</Text>
            {required && <Text size={16} weight="semibold" color={colors.error}>*</Text>}
        </Row>
    );

    if (onPress) {
        return <Pressable onPress={onPress}>{content}</Pressable>;
    }
    return content;
}

export default memo(Upload)