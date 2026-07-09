import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useListConversationsQuery } from '../../redux/Apis/Chatbot';
import { selectUser } from '../../redux/Slices/AuthSlice';
import {
  parseListConversationsResponse,
  toHistoryListItems,
} from '../../services/chatbot/chatbotHistory';

const useChatbotHistoryController = () => {
  const user = useSelector(selectUser);

  const { data, isLoading, isFetching, refetch, error } =
    useListConversationsQuery(
      { visitor_id: user?.id ?? '' },
      { skip: !user?.id },
    );

  const historyItems = useMemo(
    () => toHistoryListItems(parseListConversationsResponse(data)),
    [data],
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
