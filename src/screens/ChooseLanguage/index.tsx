import React, { FC } from "react"
import { View, TouchableOpacity, ScrollView } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import Icon from "../../components/Icon"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import styles from "./styles"
import useChooseLanguageController from "./useChooseLanguageController"

const ChooseLanguage: FC = () => {
    const {
        values: { languages, selectedLabel, isOpen },
        functions: { setSelectedLanguage, onApply, toggleDropdown },
    } = useChooseLanguageController()

    return (
        <Wrapper scrollable>
            <View style={styles.container}>
                <Text color={colors.white} style={styles.description}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.
                </Text>

                <Text weight="bold" size={18} color={colors.white} style={styles.label}>
                    Choose Language <Text color={colors.danger}>*</Text>
                </Text>

                <View style={styles.dropdownContainer}>
                    <TouchableOpacity onPress={toggleDropdown}>
                        <Row align="center" justify="space-between" style={styles.dropdownHeader}>
                            <Text color={colors.white}>{selectedLabel}</Text>
                            <View style={{ transform: [{ rotate: isOpen ? '270deg' : '90deg' }] }}>
                                <Icon
                                    source={images.right_arrow}
                                    size={20}
                                    tint_color={colors.white}
                                    no_padding
                                />
                            </View>
                        </Row>
                    </TouchableOpacity>

                    {isOpen && (
                        <View style={styles.dropdownList}>
                            {languages.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.dropdownItem}
                                    onPress={() => setSelectedLanguage(item.value)}
                                >
                                    <Text color={colors.white}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <Button
                    text="Apply"
                    onPress={onApply}
                    style={styles.applyButton}
                />
            </View>
        </Wrapper>
    )
}

export default ChooseLanguage
