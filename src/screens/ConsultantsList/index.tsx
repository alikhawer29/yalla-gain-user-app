import { FlatList, RefreshControl, View } from "react-native";
import images from "../../assets/images";
import ConsultantCard from "../../components/Cards/ConsultantCard";
import Icon from "../../components/Icon";
import Input from "../../components/Input";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import { heightPixel } from "../../utils/helper";
import useConsultantsListController from "./useConsultantsListController";

const ConsultantsList = () => {
    const {
        values: { data, isLoading, search, type },
        functions: { onReload, onSearch, onPress },
    } = useConsultantsListController();

    const placeholder = type === "doctor" ? "Search Doctor" : "Search Trainer";

    return (
        <Wrapper>
            <Row style={{ marginBottom: heightPixel(15) }} align="center" gap={10}>
                <View style={{ width: "85%" }}>
                    <Input
                        placeholder={placeholder}
                        height={40}
                        icon={images.search}
                        value={search}
                        onChangeText={onSearch}
                    />
                </View>
                <View style={{ width: "15%" }}>
                    <Icon
                        source={images.filters}
                        size={40}
                        rounded
                        less_rounded
                        border={colors.white}
                    />
                </View>
            </Row>
            <FlatList
                data={data}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item }) => (
                    <ConsultantCard
                        id={item.id}
                        photo={item.photo}
                        first_name={item.first_name}
                        last_name={item.last_name}
                        rating={item.rating}
                        total_ratings={item.total_ratings}
                        onPress={() => onPress(item.id)}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <Seperator size={15} />}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onReload} />
                }
            />
        </Wrapper>
    );
};

export default ConsultantsList;

