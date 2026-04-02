import { FC, memo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import images from "../../assets/images";
import { IUpload } from "../../interfaces";
import Icon from "../Icon";
import Row from "../Row";
import Text from "../Text";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

const Upload: FC<IUpload> = ({ text = "Upload", style, required, onPress, image, error }) => {
    const content = (
        <View style={style}>
            <Row align="center" gap={10}>
                <Icon source={images.upload} size={24} />
                <Text size={16} weight="semibold">{text}{required ? " " : ""}</Text>
                {required && <Text size={16} weight="semibold" color={colors.error}>*</Text>}
            </Row>
            {image?.uri && (
                <View style={styles.preview_container}>
                    <Image source={{ uri: image.uri }} style={styles.preview_image} />
                    <Text size={14} color={colors.gray} style={styles.preview_text}>
                        {image.fileName || 'Profile Image'}
                    </Text>
                </View>
            )}
            {error && <Text size={12} color={colors.error}>{error}</Text>}
        </View>
    );

    if (onPress) {
        return <Pressable onPress={onPress}>{content}</Pressable>;
    }
    return content;
}

const styles = StyleSheet.create({
    preview_container: {
        marginTop: heightPixel(15),
        alignItems: 'center',
        gap: heightPixel(10),
    },
    preview_image: {
        width: widthPixel(120),
        height: widthPixel(120),
        borderRadius: widthPixel(60),
        borderWidth: 2,
        borderColor: colors.primary,
    },
    preview_text: {
        marginTop: heightPixel(5),
    }
});

export default memo(Upload)