import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import images from '../../assets/images';
import Text from '../Text';
import Row from '../Row';
import Icon from '../Icon';
import { font, heightPixel, vw } from '../../utils/helper';
import Button from '../Button';
import colors from '../../utils/colors';

const ITEM_WIDTH = 250;
const ITEM_HEIGHT = 420;

const SubscriptionCarousel = ({ data, onChoosePlan, isLoading }) => {

    const [active, setActive] = useState(0)

    const renderItem = ({ item, index }) => (
        <View style={[styles.card, { borderColor: active === index ? colors.white : colors.transparent }]}>
            <View style={{ flex: 0.8 }}>
                <Text size={17} weight='bold'>{item.title}</Text>
                <Row align='center' style={{ marginTop: heightPixel(10) }} gap={5}>
                    <Text size={25} weight='bold'>{item.price}</Text>
                    <Icon source={images.coin} size={24} />
                    <Text size={12} weight='bold'>Yalla Coins</Text>
                </Row>
                <FlatList
                    data={item?.features}
                    renderItem={({ item }) => (
                        <Row gap={10} align='center'>
                            <Icon source={images.check} size={14} />
                            <Text size={12} weight='bold'>{item}</Text>
                        </Row>
                    )}
                    style={styles.features}
                />
            </View>
            <View style={{ flex: 0.2, justifyContent: "flex-end" }}>
                <Button text='Choose Plan' type={active === index ? "primary" : "outlined"} onPress={() => onChoosePlan(item.id)} loading={isLoading} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Carousel
                data={data}
                renderItem={renderItem}
                sliderWidth={vw * 100}
                itemWidth={ITEM_WIDTH}
                layout="stack"
                onSnapToItem={setActive}
                activeSlideAlignment="start"
                enableMomentum={false}
                enableSnap={true}
                scrollEnabled={true}
                useScrollView={false}
                removeClippedSubviews={false}
            />
            <Pagination
                dotsLength={data?.length}
                dotColor={colors.primary}
                inactiveDotColor={colors.gray}
                activeDotIndex={active}
                dotStyle={styles.dot}
                inactiveDotStyle={styles.dot}
                inactiveDotOpacity={1}
                inactiveDotScale={1}
            />
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: ITEM_HEIGHT + 60,
    },
    card: {
        backgroundColor: '#121212',
        borderRadius: heightPixel(16),
        padding: 20,
        height: ITEM_HEIGHT,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        borderWidth: StyleSheet.hairlineWidth
    },
    features: {
        marginVertical: heightPixel(20),
    },
    dot: {
        height: heightPixel(10),
        width: heightPixel(10),
        borderRadius: heightPixel(10)
    }
});

export default SubscriptionCarousel;
