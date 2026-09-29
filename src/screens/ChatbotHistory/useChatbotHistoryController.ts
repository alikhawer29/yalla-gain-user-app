import { useMemo, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';
import { useListConversationsQuery } from '../../redux/Apis/Chatbot';
import { selectUser } from '../../redux/Slices/AuthSlice';
import {
  parseListConversationsResponse,
  toHistoryListItems,
} from '../../services/chatbot/chatbotHistory';
import {
  getOptimisticHistoryVersion,
  mergeHistorySessions,
  subscribeOptimisticHistory,
} from '../../services/chatbot/chatbotHistoryStore';

const useChatbotHistoryController = () => {
  const user = useSelector(selectUser);
  const optimisticVersion = useSyncExternalStore(
    subscribeOptimisticHistory,
    getOptimisticHistoryVersion,
    getOptimisticHistoryVersion,
  );

  const { data, isLoading, isFetching, refetch, error } =
    useListConversationsQuery(
      { visitor_id: user?.id ?? '' },
      { skip: !user?.id },
    );

  const historyItems = useMemo(
    () =>
      toHistoryListItems(
        mergeHistorySessions(parseListConversationsResponse(data)),
      ),
    [data, optimisticVersion],
  );

  return {
    values: {
      historyItems,
      isLoading,
      isFetching,
      hasError: Boolean(error),
    },
    functions: {
      refetch,
    },
  };
};

export default useChatbotHistoryController;
