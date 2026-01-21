import { FC, memo } from "react";
import images from "../../assets/images";
import { IUpload } from "../../interfaces";
import Icon from "../Icon";
import Row from "../Row";
import Text from "../Text";

const Upload: FC<IUpload> = ({ text = "Upload", style }) => {
    return (
        <Row align="center" gap={10} style={style}>
            <Icon source={images.upload} size={24} />
            <Text size={16} weight="semibold">{text}</Text>
        </Row>
    )
}

export default memo(Upload)