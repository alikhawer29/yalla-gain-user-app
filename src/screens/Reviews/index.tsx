import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import images from '../../assets/images';
import Icon from '../../components/Icon';
import Image from '../../components/Image';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Touchable from '../../components/Touchable';
import Wrapper from '../../components/Wrapper';
import colors from '../../utils/colors';
import useReviewsController from './useReviewsController';
import styles from './styles';

const Reviews = () => {
  const {
    values: {
      reviews,
      ratingBreakdown,
      averageRating,
      totalReviews,
      isLoading,
      selectedFilter,
      filterTabs,
    },
    functions: { onReload, onFilterChange },
  } = useReviewsController();

  const renderStars = (rating: number, size: number = 12) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        source={images.helpdesk.star}
        size={size}
        tint_color={i < rating ? '#FFD700' : colors.icon_gray}
      />
    ));
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.review_card}>
      <View style={styles.review_header}>
        <View style={styles.reviewer_image}>
          <Image
            source={item.user?.photo ? { uri: item.user.photo } : images.dummy}
            style={styles.image}
            resize="cover"
          />
        </View>
        <View style={styles.review_header_content}>
          <View style={styles.review_name_row}>
            <Text weight="semibold" size={14}>
              {item.user?.first_name} {item.user?.last_name}
            </Text>
            <Text size={12} color={colors.icon_gray}>
              {item.created_at}
            </Text>
          </View>
          <View style={styles.stars_row}>{renderStars(item.rating)}</View>
        </View>
      </View>
      <Text size={13} color={colors.icon_gray} style={styles.review_text}>
        {item.review}
      </Text>
    </View>
  );

  return (
    <Wrapper>
      {/* Rating Breakdown */}
      <View style={styles.breakdown_container}>
        {ratingBreakdown.map(item => (
          <Row
            key={item.star}
            align="center"
            gap={10}
            style={styles.breakdown_row}
          >
            <View style={styles.star_label}>
              <Text size={14}>{item.star} star</Text>
            </View>
            <View style={styles.progress_bar}>
              <View
                style={[styles.progress_fill, { width: `${item.percentage}%` }]}
              />
            </View>
          </Row>
        ))}
        {/* Average Rating */}
        <View style={styles.average_container}>
          <Text size={23} weight="bold" color={colors.white}>
            {averageRating}
          </Text>
          <Text size={18} color={colors.icon_gray}>
            /5
          </Text>
          <Text size={16} color={colors.icon_gray} style={{ marginLeft: 8 }}>
            ({totalReviews})
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters_scroll}
        contentContainerStyle={{ paddingRight: 10 }}
      >
        <Row gap={10}>
          {filterTabs.map(filter => (
            <Touchable
              key={filter.value}
              style={[
                styles.filter_item,
                selectedFilter === filter.value && styles.filter_item_selected,
              ]}
              onPress={() => onFilterChange(filter.value)}
            >
              <Text size={14} color={colors.white}>
                {filter.value === 'all' ? (
                  ''
                ) : (
                  <Icon source={images.helpdesk.star} size={10} />
                )}

                {filter.label}
              </Text>
            </Touchable>
          ))}
        </Row>
      </ScrollView>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onReload} />
        }
      />
    </Wrapper>
  );
};

export default Reviews;
