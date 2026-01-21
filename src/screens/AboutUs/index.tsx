import React, { FC } from "react"
import { View, TouchableOpacity } from "react-native"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import styles from "./styles"

const AboutUs: FC = () => {
    return (
        <Wrapper scrollable>
            <View style={styles.container}>
                <Text color={colors.white} style={styles.text}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.
                </Text>

                <Text color={colors.white} style={styles.text}>
                    Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor.
                </Text>

                <Text color={colors.white} style={styles.text}>
                    nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor
                </Text>

                <View style={styles.footerContainer}>
                    <View style={styles.followRow}>
                        <View style={styles.line} />
                        <Text color={colors.white} weight="semibold" style={styles.followText}>Follow Us Here</Text>
                        <View style={styles.line} />
                    </View>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialIcon}>
                            <Icon source={images.facebook_new} size={50} no_padding />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialIcon}>
                            <Icon source={images.twitter} size={50} no_padding />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialIcon}>
                            <Icon source={images.instagram} size={50} no_padding />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialIcon}>
                            <Icon source={images.linkedin} size={50} no_padding />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Wrapper>
    )
}

export default AboutUs
