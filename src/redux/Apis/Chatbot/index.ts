import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const CHAT_URL = 'https://core-model-v2.botnest.ai/v1/';
const CHAT_CONFIG = {
  project_id: '6878dfb12d12632e219e5a4c',
  bot_id: '6878dfb12d12632e219e5a4e',
  user_id: '6878d66b2d12632e219e5a3a',
};

export const chatbotApi = createApi({
  reducerPath: 'chatbotApi',
  baseQuery: fetchBaseQuery({
    baseUrl: CHAT_URL,
    responseHandler: async response => {
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        return response.json();
      }

      if (contentType?.includes('text/plain')) {
        const text = await response.text();
        return { text };
      }

      return response.text();
    },
  }),
  endpoints: builder => ({
    createConversation: builder.mutation({
      query: params => ({
        url: 'new_conversation',
        method: 'POST',
        params: { ...CHAT_CONFIG, ...params },
        body: {},
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    }),
    sendQuestion: builder.mutation({
      query: ({ question, session_id, voice_note }) => {
        const formData = new FormData();
        formData.append('voice_note', voice_note ?? '');

        return {
          url: 'query',
          method: 'POST',
          params: {
            ...CHAT_CONFIG,
            question,
            session_id,
          },
          body: formData,
          headers: {
            accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
    endSession: builder.mutation({
      query: body => ({
        url: 'end_session',
        method: 'POST',
        params: {
          ...CHAT_CONFIG,
          ...body,
        },
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
});

export const {
  useCreateConversationMutation,
  useEndSessionMutation,
  useSendQuestionMutation,
} = chatbotApi;
