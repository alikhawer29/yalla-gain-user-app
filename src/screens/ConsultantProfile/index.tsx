import { FlatList, View } from "react-native";
import images from "../../assets/images";
import Icon from "../../components/Icon";
import Image from "../../components/Image";
import Input from "../../components/Input";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Text from "../../components/Text";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";
import useConsultantProfileController from "./useConsultantProfileController";
import styles from "./styles";
import ServiceCard from "./ServiceCard";

const ConsultantProfile = () => {
    const {
        values: { consultant, services, isLoading, isRefreshing, search, type },
        functions: { onSearch, onServicePress, onShowReviews, onReload },
    } = useConsultantProfileController();

    const placeholder = type === "doctor" ? "Search Services" : "Search Services";
    const title = type === "doctor" ? "Doctor Name:" : "Trainer Name:";

    const renderExperience = () => {
        const exp = consultant?.experience?.[0];
        if (!exp) return null;
        return `${exp.experience} years - ${exp.specialization}`;
    };

    return (
        <Wrapper
            scrollable
            loading={isLoading}
            onRefresh={onReload}
            refreshing={isRefreshing}
        >
            <Row style={{ marginBottom: heightPixel(15) }} align="center" gap={10}>
                <View style={{ width: "100%" }}>
                    <Input
                        placeholder={placeholder}
                        height={40}
                        icon={images.search}
                        value={search}
                        onChangeText={onSearch}
                    />
                </View>
            </Row>

            {/* Profile Header */}
            <Row gap={15} style={styles.profile_header}>
                <View style={styles.profile_image_container}>
                    <Image
                        source={consultant?.photo ? { uri: consultant.photo } : images.dummy}
                        style={styles.profile_image}
                        resize="cover"
                    />
                </View>
                <View style={styles.profile_info}>
                    <Text size={14}><Text weight="bold">{title}</Text>
                        <Text color="#999999">
                            {" "}{consultant?.first_name} {consultant?.last_name}
                        </Text>
                    </Text>
                    <Text size={14}><Text weight="bold">Category:</Text>
                        {" "}<Text color="#999999">
                            {consultant?.type ?
                                consultant.type.charAt(0).toUpperCase() + consultant.type.slice(1).toLowerCase()
                                : '-'
                            }
                        </Text>
                    </Text>
                    <Text size={14}><Text weight="bold">Specialization:</Text>
                        {" "}<Text color="#999999">{consultant?.experience?.[0]?.specialization || '-'}</Text>
                    </Text>
                    <Text size={14}><Text weight="bold">Experience:</Text>
                        {" "}<Text color="#999999">{renderExperience() || '-'}</Text>
                    </Text>
                    <Text size={14}><Text weight="bold">Gender:</Text>
                        {" "}<Text color="#999999">{consultant?.gender ?
                            consultant.gender.charAt(0).toUpperCase() + consultant.gender.slice(1).toLowerCase()
                            : '-'
                        }</Text>
                    </Text>
                    <Text size={14} color="#4A98F4" onPress={onShowReviews} underline>
                        Show Reviews
                    </Text>
                </View>
            </Row>

            {/* Location */}
            <Row gap={14} style={styles.location_row}>
                <Text size={14}><Text weight="bold">City:</Text> <Text color="#999999">{consultant?.city || '-'}</Text> </Text>
            </Row>
            <Row gap={14} style={styles.location_row}>
                <Text size={14}><Text weight="bold">State:</Text> <Text color="#999999">{consultant?.state || '-'}</Text> </Text>
            </Row>
            <Row gap={14} style={styles.location_row}>
                <Text size={14}><Text weight="bold">Language:</Text> <Text color="#999999">{consultant?.language || '-'}</Text> </Text>
            </Row>

            <Seperator size={20} />

            {/* About */}
            <Text size={16} weight="bold" style={styles.section_title}>About:</Text>
            <Text size={14} color={colors.icon_gray} style={styles.about_text}>
                {consultant?.bio || 'No bio available.'}
            </Text>

            <Seperator size={20} />

            {/* Educational Details */}
            <Text size={20} weight="bold" style={styles.section_title}>Educational Details</Text>
            {consultant?.certifications?.map((cert: any, index: number) => (
                <Row key={cert.id || index} style={styles.education_row}>
                    <View style={{ width: "48%" }}>
                        <Text size={14}>Institution Name:</Text>
                        <Text size={14} color={colors.icon_gray}>{cert.institute_name}</Text>
                    </View>
                    <View style={{ width: "48%" }}>
                        <Text size={14}>Degree Title:</Text>
                        <Text size={14} color={colors.icon_gray}>{cert.certificate_title}</Text>
                    </View>
                </Row>
            ))}

            <Seperator size={20} />

            {/* Services */}
            <Text size={24} weight="bold" style={styles.section_title}>Services</Text>
            <FlatList
                data={services}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <ServiceCard
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        image={item.image}
                        charges={item.charges}
                        onPress={() => onServicePress(item.id)}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={{ width: widthPixel(15) }} />}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyServices}>
                            <Text size={14} color={colors.icon_gray}>
                                {search.trim()
                                    ? 'No services found'
                                    : 'No services available'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </Wrapper>
    );
};

export default ConsultantProfile;

