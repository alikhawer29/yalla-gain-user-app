import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import images from '../../assets/images';
import { useSubscriptionScreenGuard } from '../../hooks/useSubscriptionScreenGuard';
import CreatePostCard from '../../components/Cards/CreatePostCard';
import NewsFeedCard from '../../components/Cards/NewsFeedCard';
import Icon from '../../components/Icon';
import Wrapper from '../../components/Wrapper';
import Text from '../../components/Text';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';
import useNewsFeedController from './useNewsFeedController';
import styles from './styles';

const NewsFeed = () => {
  const navigation = useNavigation();
  useSubscriptionScreenGuard('messaging');
  const searchInputRef = useRef<TextInput>(null);

  const {
    values: {
      data,
      isLoading,
      isFetching,
      isRefreshing,
      search,
      searchResults,
      showSearchResults,
      isSearching,
    },
    functions: { handleRefresh, handleLoadMore, onSearch, onUserPress, refetch },
  } = useNewsFeedController();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'none' },
        });
      }

      refetch();
    }, [navigation, refetch]),
  );

  const renderFooter = () => {
    if (!isFetching || showSearchResults) return null;
    return (
      <View style={{ paddingVertical: heightPixel(20) }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: heightPixel(100),
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: heightPixel(100),
        }}
      >
        <Text size={16} color={colors.icon_gray}>
          No posts available
        </Text>
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!showSearchResults) return null;

    if (isSearching) {
      return (
        <View style={[styles.searchResults, styles.searchLoading]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={[styles.searchResults, styles.searchEmpty]}>
          <Text size={14} color={colors.icon_gray}>
            No users found
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.searchResults}>
        {searchResults.map((user, index) => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.searchResultItem,
              index === searchResults.length - 1 && styles.searchResultItemLast,
            ]}
            onPress={() => onUserPress(user.id)}
            activeOpacity={0.7}
          >
            <Icon
              source={user.photo ? { uri: user.photo } : images.dummy}
              size={40}
              rounded
              no_padding
              border={colors.white}
              resize="cover"
            />
            <Text weight="semibold">
              {user.first_name} {user.last_name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderListHeader = useCallback(() => <CreatePostCard />, []);

  const hasData =
    data && 'data' in data && Array.isArray(data.data) && data.data.length > 0;

  if (isLoading && !hasData) {
    return (
      <Wrapper scrollable>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: heightPixel(100),
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper scrollable={false}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputRow}>
          <Icon source={images.search} size={13.5} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search users by name"
            placeholderTextColor={colors.white}
            value={search}
            onChangeText={onSearch}
            selectionColor={colors.primary}
            autoCorrect={false}
            autoCapitalize="none"
            blurOnSubmit={false}
            returnKeyType="search"
          />
        </View>
        {renderSearchResults()}
      </View>

      <FlatList
        style={styles.feedList}
        data={data?.data || []}
        renderItem={({ item }) => <NewsFeedCard {...item} />}
        keyExtractor={(item, index) => `post-${item.id}-${index}`}
        ItemSeparatorComponent={() => (
          <View style={{ height: heightPixel(10) }} />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListHeaderComponentStyle={{ marginBottom: heightPixel(10) }}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </Wrapper>
  );
};

export default NewsFeed;
