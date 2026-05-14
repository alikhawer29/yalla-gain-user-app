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
                    Yalla Gain is an innovative fitness and wellness platform focused on helping users transform their lifestyle through smart technology, body tracking, and personalized fitness experiences.
                </Text>

                <Text color={colors.white} style={styles.text}>
                    Our platform combines advanced body scanning, progress tracking, fitness challenges, workout plans, and trainer connectivity to create a complete health and transformation ecosystem. We aim to make fitness more interactive, motivating, and measurable for every user.
                </Text>

                <Text color={colors.white} style={styles.text}>
                    At Yalla Gain, we believe consistency and accurate progress tracking are the keys to achieving long-term fitness goals. Our mission is to empower users with the tools, insights, and support they need to build healthier habits and confidently track their transformation journey.
                </Text>
                <Text color={colors.white} style={styles.text}>
                    Yalla Gain is designed for individuals at every stage of their fitness journey, whether they are beginners looking to build healthier routines or experienced athletes aiming to optimize performance and monitor body changes more accurately.
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
