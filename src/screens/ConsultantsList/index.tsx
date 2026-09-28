import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import images from "../../assets/images";
import Button from "../../components/Button";
import ConsultantCard from "../../components/Cards/ConsultantCard";
import Empty from "../../components/Empty";
import Input from "../../components/Input";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import { heightPixel } from "../../utils/helper";
import useConsultantsListController from "./useConsultantsListController";

const ConsultantsList = () => {
    const {
        values: { data, isLoading, isLoadingMore, hasMore, search, type },
        functions: { onReload, onLoadMore, onSearch, onPress },
    } = useConsultantsListController();

    const placeholder = type === "doctor" ? "Search Doctors" : "Search Trainer";
    const emptyMessage = type === "doctor" ? "No doctors found" : "No trainers found";

    return (
        <Wrapper>
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
            <FlatList
                data={data}
                numColumns={2}
                columnWrapperStyle={data.length > 0 ? { justifyContent: "space-between" } : undefined}
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
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onReload}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View style={{ paddingVertical: heightPixel(40), alignItems: "center" }}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <Empty message={emptyMessage} />
                    )
                }
                ListFooterComponent={
                    hasMore && data.length > 0 ? (
                        <View style={{ paddingVertical: heightPixel(20), alignItems: "center" }}>
                            <Button
                                text="Load More"
                                type="outlined"
                                onPress={onLoadMore}
                                loading={isLoadingMore}
                                style={{ minWidth: 160 }}
                            />
                        </View>
                    ) : null
                }
            />
        </Wrapper>
    );
};

export default ConsultantsList;
