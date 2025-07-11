import { FC, memo } from "react";
import { ITabs } from "../../interfaces";
import colors from "../../utils/colors";
import Row from "../Row";
import Text from "../Text";
import Touchable from "../Touchable";
import styles from "./styles";
import { heightPixel, widthPixel } from "../../utils/helper";

const Tabs: FC<ITabs> = ({ tabs = [], selected, setSelected, type = "advanced" }) => {
    return (
        <Row style={type === "basic" ? styles.container_basic : styles.container} align="center">
            {
                tabs.map((item, index) => (
                    type === "basic" ?
                        <Touchable effect={false} style={[styles.item_basic, { backgroundColor: colors.transparent, marginLeft: index > 0 ? widthPixel(20) : 0, borderBottomWidth: selected === item.value ? heightPixel(2) : 0, borderColor: colors.primary }]} onPress={() => setSelected(item.value)}>
                            <Text size={21} line_height={40} weight={selected === item.value ? "bold" : "semibold"} color={selected === item.value ? colors.primary : colors.icon_gray}>{item.label}</Text>
                        </Touchable> :
                        <Touchable effect={false} style={[styles.item, { backgroundColor: selected === item.value ? colors.primary : colors.transparent, borderLeftWidth: index % 2 ? 1 : 0, borderRightWidth: index % 2 ? 1 : 0 }]} onPress={() => setSelected(item.value)}>
                            <Text size={16} weight="bold">{item.label}</Text>
                        </Touchable>
                ))
            }
        </Row>
    )
}

export default memo(Tabs)