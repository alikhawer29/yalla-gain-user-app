import { FC, memo } from "react"
import { Image, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import images from "../../assets/images"
import { IAuthWrapper } from "../../interfaces"
import Text from "../Text"
import Wrapper from "../Wrapper"
import styles from "./styles"

const AuthWrapper: FC<IAuthWrapper> = ({ title, subtitle, children }) => (
    <Wrapper>
        <KeyboardAwareScrollView enableOnAndroid showsVerticalScrollIndicator={false}>
            <Image source={images.logo} style={styles.logo} />
            {
                (title || subtitle) &&
                <View style={styles.title_wrapper}>
                    {title && <Text size={20} weight='bold'>{title}</Text>}
                    {subtitle && <Text position="center" size={12} style={styles.subtitle}>{subtitle}</Text>}
                </View>
            }
            <View style={styles.form_wrapper}>
                {children}
            </View>
        </KeyboardAwareScrollView>
    </Wrapper>
)

export default memo(AuthWrapper)