import { FC, memo, useCallback } from "react"
import { MenuOption, MenuOptions, MenuTrigger, Menu as PopupMenu } from "react-native-popup-menu"
import images from "../../assets/images"
import colors from "../../utils/colors"
import Icon from "../Icon"
import Text from "../Text"
import { heightPixel, widthPixel } from "../../utils/helper"

const Menu: FC = ({ dropdown_items = [], style = {} }) => {

    const ITEMS = [
        ...dropdown_items,
    ]

    const onPressItem = useCallback((value) => {
        if (value?.onPress) {
            value.onPress()
        }
    }, [])

    return (
        <PopupMenu style={style}>
            <MenuTrigger>
                <Icon source={images.dots} size={20} rounded color={colors.black} border={colors.gray} less_padding />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{ backgroundColor: colors.black, borderColor: colors.gray, borderRadius: heightPixel(10), borderWidth: 1, width: widthPixel(58), marginTop: heightPixel(25) }}>
                {/* <MenuOptions optionsContainerStyle={styles.option_container}> */}
                {
                    ITEMS.map((item, index) => (
                        <MenuOption onSelect={() => onPressItem(item)} style={{ borderBottomWidth: index < ITEMS.length - 1 ? 1 : 0, borderColor: colors.bluish_primary, padding: heightPixel(5) }}>
                            <Text size={10} color={item?.color || colors.white} weight={"semibold"} position="center">{item?.label}</Text>
                        </MenuOption>
                    ))
                }
            </MenuOptions>
        </PopupMenu>
    )
}

export default memo(Menu)