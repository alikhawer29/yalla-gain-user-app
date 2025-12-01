import { RefreshControl, ScrollView, View } from "react-native";
import images from "../../assets/images";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import Image from "../../components/Image";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Text from "../../components/Text";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import { heightPixel } from "../../utils/helper";
import useServiceDetailsController from "./useServiceDetailsController";
import styles from "./styles";

const ServiceDetails = () => {
    const {
        values: { service, consultant, category, isLoading, type },
        functions: { onReload, onBookAppointment },
    } = useServiceDetailsController();

    const nameLabel = type === "doctor" ? "Doctor Name:" : "Trainer Name:";

    return (
        <Wrapper scrollable bottom_bar loading={isLoading}>
            {/* Service Image */}
            <View style={styles.image_container}>
                <Image
                    source={service?.image ? { uri: service.image } : images.dummy}
                    style={styles.image}
                    resize="cover"
                />
            </View>

            <Seperator size={20} />

            {/* Doctor/Trainer Info */}
            <Row justify="space-between" style={styles.info_row}>
                <View style={{ width: "48%" }}>
                    <Text size={16} >{nameLabel}</Text>
                    <Text size={16} color={colors.primary}>
                        {consultant?.first_name} {consultant?.last_name}
                    </Text>
                </View>
                <View style={{ width: "48%" }}>
                    <Text size={16} >Category:</Text>
                    <Text size={16} color={colors.icon_gray}>{category?.title || '-'}</Text>
                </View>
            </Row>

            <Seperator size={20} />

            {/* Appointment Charges */}
            <Text size={16} weight="bold">Appointment Charges:</Text>
            <Row align="center" gap={4} style={styles.charges_row}>
                <Text size={18} weight="bold">{service?.charges || 0}</Text>
                <Icon source={images.coin} size={18} />
                <Text size={14} >Yalla Coins</Text>
            </Row>

            <Seperator size={20} />

            {/* Description */}
            <Text size={16} weight="bold">Description:</Text>
            <Text size={14} color='#D9D9D9' style={styles.description}>
                {service?.description || 'No description available.'}
            </Text>

            <Seperator size={40} />

            {/* Book Appointment Button */}
            <Button text="Book Appointment" onPress={onBookAppointment} />
        </Wrapper>
    );
};

export default ServiceDetails;

