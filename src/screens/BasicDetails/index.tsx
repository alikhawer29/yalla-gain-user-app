import React, { FC } from "react"
import { View } from "react-native"
import images from "../../assets/images"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import styles from "./styles"

const BasicDetails: FC = () => {
    return (
        <Wrapper scrollable>
            <View style={styles.container}>
                <Text color={colors.white} style={styles.text}>
                    Yalla Gain is a fitness and body transformation platform designed to help users track their progress, improve their physique, and achieve their health goals through smart technology and personalized experiences.
                </Text>

                <Text color={colors.white} style={styles.text}>
                    The app allows users to perform body scans, monitor measurements, track BMI and progress over time, complete fitness challenges, and interact with customized avatars based on their body data. Users can also connect with trainers, follow workout plans, and stay motivated throughout their fitness journey.
                </Text>

                <Text color={colors.white} style={styles.text}>
                    With advanced body measurement tracking, progress visualization, and interactive fitness features, Yalla Gain provides a complete ecosystem for users who want to build healthier habits and achieve consistent results.
                </Text>

                <Image
                    source={images.fitness_content}
                    style={styles.image}
                    resize="cover"
                />
            </View>
        </Wrapper>
    )
}

export default BasicDetails
