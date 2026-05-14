import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_USER_BASE_URL } from '../../../utils/data';
import { RootState } from '../../Store';

export interface WeeklyCaloriesDataPoint {
  day: string;
  calories: number;
}

export interface MonthlyCaloriesDataPoint {
  date: string;
  calories: number;
}

export interface CaloriesGraphResponse {
  filter: 'weekly' | 'monthly';
  status: boolean;
  execution_time: string;
  data: WeeklyCaloriesDataPoint[] | MonthlyCaloriesDataPoint[];
}

export interface MonthlyBmiGraphPoint {
  month: number;
  label: string;
  bmi: number;
}

export interface MonthlyBmiGraphResponse {
  status: boolean;
  user_id: number;
  year: number;
  data: MonthlyBmiGraphPoint[];
}

export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: [
    'SavedContent',
    'VideoDetails',
    'WorkoutVideos',
    'Bookings',
    'Consultants',
    'Chats',
    'Posts',
    'BlockedUsers',
    'Wallet',
    'Challenges',
    'Notifications',
    'HealthCalories',
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: API_USER_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state?.auth?.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      headers.set('Accept', `application/json`);
      return headers;
    },
  }),
  endpoints: builder => ({
    changePassword: builder.mutation({
      query: body => ({
        url: `change-password`,
        method: 'POST',
        body,
      }),
    }),
    updateProfile: builder.mutation({
      query: body => ({
        url: `profile/update`,
        method: 'POST',
        body,
      }),
    }),
    getSubscriptionPlans: builder.query({
      query: () => ({
        url: `plans`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    getSubscriptionLogs: builder.query({
      query: () => ({
        url: `subscription-logs`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    subscribe: builder.mutation({
      query: body => ({
        url: `payment`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet'],
    }),
    cancelSubscription: builder.mutation({
      query: id => ({
        url: `subscription/${id}/cancel`,
        method: 'POST',
      }),
    }),
    // Newsfeed
    createFeed: builder.mutation({
      query: body => ({
        url: `post`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Posts'],
    }),
    postBodyMeasurements: builder.mutation<any, void>({
      query: () => ({
        url: `post/body-measurements`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'],
    }),
    updateFeed: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Posts'],
    }),
    deleteFeed: builder.mutation({
      query: id => ({
        url: `post/${id}/delete`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'],
    }),
    reactFeed: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/react`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Posts'],
    }),
    reactComment: builder.mutation({
      query: ({ id, body }) => ({
        url: `comment/${id}/react`,
        method: 'POST',
        body,
      }),
    }),
    postComment: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/comment`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Posts'],
    }),
    deleteComment: builder.mutation({
      query: id => ({
        url: `comment/${id}/remove`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'],
    }),
    reportFeed: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/report`,
        method: 'POST',
        body,
      }),
    }),
    votePoll: builder.mutation({
      query: ({ post_id, option_id }) => ({
        url: `post/${post_id}/${option_id}/poll`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'],
    }),
    getFeeds: builder.query({
      query: query => ({
        url: query?.user_id ? `posts/${query?.user_id}` : `posts`,
        method: 'GET',
        query,
      }),
      providesTags: ['Posts'],
    }),
    getFeedById: builder.query({
      query: id => ({
        url: `post/${id}`,
        method: 'GET',
      }),
    }),
    getMyFeeds: builder.query({
      query: query => ({
        url: `posts/my/get`,
        method: 'GET',
        params: query,
      }),
      providesTags: ['Posts'],
    }),
    getComments: builder.query({
      query: id => ({
        url: `post/${id}/comments`,
        method: 'GET',
      }),
    }),
    getReacts: builder.query({
      query: id => ({
        url: `post/${id}/reacted`,
        method: 'GET',
      }),
    }),
    // workout
    saveVideo: builder.mutation({
      query: id => ({
        url: `video/${id}/save`,
        method: 'POST',
      }),
      invalidatesTags: ['SavedContent', 'VideoDetails', 'WorkoutVideos'],
    }),
    getSavedContent: builder.query({
      query: params => ({
        url: `saved/videos`,
        method: 'GET',
        params,
      }),
      providesTags: ['SavedContent'],
    }),
    getWorkout: builder.query({
      query: (params?: {
        search?: string;
        from?: string;
        to?: string;
        muscle_id?: number;
      }) => ({
        url: `workout-contents`,
        method: 'GET',
        params,
      }),
    }),

    getMuscles: builder.query({
      query: () => ({
        url: `muscles`,
        method: 'GET',
      }),
    }),

    getMuscleExerciseTypes: builder.query({
      query: (muscleId: number) => ({
        url: `muscles/${muscleId}/exercise-types`,
        method: 'GET',
      }),
    }),

    getDashboard: builder.query({
      query: () => ({
        url: `dashboard`,
        method: 'GET',
      }),
    }),

    getCaloriesGraph: builder.query<
      CaloriesGraphResponse,
      'weekly' | 'monthly'
    >({
      query: filter => ({
        url: `health/calories-graph`,
        method: 'GET',
        params: { filter },
      }),
      providesTags: ['HealthCalories'],
      keepUnusedDataFor: 0,
    }),

    getNotifications: builder.query({
      query: params => ({
        url: `notification/all/list`,
        method: 'GET',
        params,
      }),
      providesTags: ['Notifications'],
    }),

    markNotificationRead: builder.mutation({
      query: body => ({
        url: `notification/read`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),

    markNotificationUnread: builder.mutation({
      query: body => ({
        url: `notification/unread`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),
    getVideosByWorkout: builder.query({
      query: (data?: {
        id?: number;
        params?: {
          search?: string;
          from?: string;
          to?: string;
          exercise_id?: number;
        };
      }) => ({
        url: `workout-content/${data?.id}/videos`,
        method: 'GET',
        params: data?.params,
      }),
      providesTags: ['WorkoutVideos'],
    }),
    getVideoDetails: builder.query({
      query: id => ({
        url: `video/${id}`,
        method: 'GET',
      }),
      providesTags: ['VideoDetails'],
    }),
    // Consultation & Booking
    getAllDoctors: builder.query({
      query: params => ({
        url: `all-doctors`,
        method: 'GET',
        params,
      }),
      providesTags: ['Consultants'],
    }),
    getAllTrainers: builder.query({
      query: params => ({
        url: `all-trainers`,
        method: 'GET',
        params,
      }),
      providesTags: ['Consultants'],
    }),
    viewDoctor: builder.query({
      query: id => ({
        url: `view-doctor/${id}`,
        method: 'GET',
      }),
    }),
    getServiceDetails: builder.query({
      query: id => ({
        url: `service-detail/${id}`,
        method: 'GET',
      }),
    }),
    getServiceSlots: builder.query({
      query: ({ serviceId, date }: { serviceId: number; date?: string }) => ({
        url: `service-slots/${serviceId}`,
        method: 'GET',
        params: date ? { date } : undefined,
      }),
    }),
    bookAppointment: builder.mutation({
      query: body => ({
        url: `book/appointment`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Bookings', 'Wallet'],
    }),
    getMyBookings: builder.query({
      query: params => ({
        url: `my-bookings`,
        method: 'GET',
        params,
      }),
      providesTags: ['Bookings'],
    }),
    getBookingDetails: builder.query({
      query: id => ({
        url: `my-booking/${id}`,
        method: 'GET',
      }),
      // Disable caching by not providing tags
      // providesTags: (result, error, id) => [{ type: 'Bookings', id }],

      // Alternative: Set cache time to 0
      keepUnusedDataFor: 0, // Immediately remove from cache when unused
    }),
    getDoctorReviews: builder.query({
      query: id => ({
        url: `doctor-reviews/${id}`,
        method: 'GET',
      }),
    }),
    approveReschedule: builder.mutation({
      query: id => ({
        url: `my-booking/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Bookings'],
    }),
    rejectReschedule: builder.mutation({
      query: ({
        id,
        rejection_reason,
      }: {
        id: number;
        rejection_reason: string;
      }) => ({
        url: `my-booking/${id}/reject`,
        method: 'POST',
        body: { rejection_reason },
      }),
      invalidatesTags: ['Bookings'],
    }),
    createChat: builder.mutation({
      query: (user_id: number) => ({
        url: 'chat/create',
        method: 'POST',
        body: { user_id },
      }),
      invalidatesTags: ['Chats'],
    }),
    createAdminChat: builder.mutation({
      query: () => ({
        url: 'chat/createAdmin',
        method: 'POST',
      }),
      invalidatesTags: ['Chats'],
    }),
    blockUser: builder.mutation({
      query: (user_id: number) => ({
        url: `block/${user_id}`,
        method: 'POST',
      }),
      invalidatesTags: ['BlockedUsers', 'Posts'],
    }),
    getBlockedUsers: builder.query({
      query: () => ({
        url: 'block/users',
        method: 'GET',
      }),
      providesTags: ['BlockedUsers'],
      keepUnusedDataFor: 0,
    }),
    unblockUser: builder.mutation({
      query: (user_id: number) => ({
        url: `block/${user_id}`,
        method: 'POST',
      }),
      invalidatesTags: ['BlockedUsers'],
    }),
    // Chat APIs
    getChatList: builder.query({
      query: () => ({
        url: 'chat/getChatList',
        method: 'GET',
      }),
      providesTags: ['Chats'],
      keepUnusedDataFor: 0,
    }),
    getChat: builder.query({
      query: (chatId: number) => ({
        url: `chat/getChat/${chatId}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    sendMessage: builder.mutation({
      query: (formData: FormData) => ({
        url: 'chat/sendMessage',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),
    getUnreadChats: builder.query({
      query: () => ({
        url: 'chat/getUnread-chats',
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    rateBooking: builder.mutation({
      query: ({
        id,
        rating,
        review,
      }: {
        id: number;
        rating: number;
        review: string;
      }) => ({
        url: `my-booking/${id}/rate`,
        method: 'POST',
        body: { rating, review },
      }),
      invalidatesTags: ['Bookings'],
    }),
    reportBooking: builder.mutation({
      query: ({ id, formData }: { id: number; formData: FormData }) => ({
        url: `my-booking/${id}/report`,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Bookings'],
    }),
    /** POST /user/my-booking/:id/tip — body: { coins } */
    giveTip: builder.mutation({
      query: ({ id, coins }: { id: number; coins: number }) => ({
        url: `my-booking/${id}/tip`,
        method: 'POST',
        body: { coins },
      }),
      invalidatesTags: ['Bookings', 'Wallet'],
    }),
    //GET Coins
    getWalletCoins: builder.query({
      query: () => ({
        url: 'wallet',
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
      providesTags: ['Wallet'],
    }),
    transferYallaCoin: builder.mutation({
      query: payload => ({
        url: 'transfer-yalla-coin',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Wallet'],
    }),
    buyYallaCoin: builder.mutation({
      query: payload => ({
        url: 'buy-yalla-coin',
        method: 'POST',
        body: payload,
      }),
    }),
    confirmPayment: builder.mutation({
      query: payload => ({
        url: 'buy-yalla-coin/after-payment',
        method: 'POST',
        body: payload,
      }),
    }),
    scanAvatar: builder.mutation({
      query: (formData: FormData) => ({
        url: 'scan',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),
    updateAvatar: builder.mutation({
      query: (body: {
        avatar: 'initial' | 'future';
        type: 'view' | 'edit';
      }) => ({
        url: 'avatar/update',
        method: 'POST',
        body,
      }),
    }),
    // Used by ProgressTracking to decide if user can open initial Unity avatar.
    // POST /scan/status with body: { user_id }
    scanStatus: builder.mutation({
      query: (userId: number | string) => ({
        url: 'scan/status',
        method: 'POST',
        body: { user_id: userId },
      }),
    }),
    getMonthlyBmiGraph: builder.query<
      MonthlyBmiGraphResponse,
      { year?: number }
    >({
      query: ({ year } = {}) => ({
        url: 'scan/monthly-bmi-graph',
        method: 'GET',
        params: year != null ? { year } : undefined,
      }),
      keepUnusedDataFor: 0,
    }),
    getAvatarWithChallenge: builder.query({
      query: (userId: number | string) => ({
        url: 'avatar/with-challenge',
        method: 'GET',
        params: { user_id: userId },
      }),
    }),
    getFaqs: builder.query({
      query: () => ({
        url: `faqs`,
        method: 'GET',
      }),
      // Always fetch fresh FAQs when screen mounts again
      keepUnusedDataFor: 0,
    }),
    contactUs: builder.mutation({
      query: body => ({
        url: `contact-us`,
        method: 'POST',
        body,
      }),
    }),
    // Challenges
    getChallenges: builder.query({
      query: (params?: { search?: string; type?: string }) => ({
        url: `challenges`,
        method: 'GET',
        params,
      }),
      providesTags: ['Challenges'],
    }),
    getChallengeById: builder.query({
      query: (id: number) => ({
        url: `challenge/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Challenges', id }],
      keepUnusedDataFor: 0,
    }),
    startChallenge: builder.mutation({
      query: (id: number) => ({
        url: `challenge/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Challenges', id },
        'Challenges',
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData('getChallengeById', id, draft => {
              const target = (draft as any)?.data ?? draft;
              if (target && typeof target === 'object') {
                (target as any).is_started = true;
                (target as any).challenge_status =
                  (target as any).challenge_status ?? 'ongoing';
                (target as any).challenge_progress = (target as any)
                  .challenge_progress ?? { id: id, status: 'ongoing' };
              }
            }),
          );
        } catch (_) {}
      },
    }),
    startTodayTask: builder.mutation({
      query: (id: number) => ({
        url: `challenge/${id}/startTodayTask`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Challenges', id },
        'Challenges',
      ],
    }),
    completeTodayTask: builder.mutation({
      query: (id: number) => ({
        url: `challenge/${id}/completeTodayTask`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Challenges', id },
        'Challenges',
      ],
    }),
    leaveChallenge: builder.mutation({
      query: (id: number) => ({
        url: `challenge/${id}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Challenges', id },
        'Challenges',
      ],
    }),
    claimChallengeReward: builder.mutation({
      query: (id: number) => ({
        url: `challenge/${id}/claim-reward`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Challenges', id },
        'Challenges',
        'Wallet',
      ],
    }),
    getChallengeLogs: builder.query({
      query: (params?: { search?: string; from?: string; to?: string }) => ({
        url: `challenge/logs/my`,
        method: 'GET',
        params,
      }),
      providesTags: ['Challenges'],
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: `delete-account`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useGetSubscriptionPlansQuery,
  useGetSubscriptionLogsQuery,
  useSubscribeMutation,
  useCancelSubscriptionMutation,
  useCreateFeedMutation,
  usePostBodyMeasurementsMutation,
  useUpdateFeedMutation,
  useDeleteFeedMutation,
  useReactFeedMutation,
  useReactCommentMutation,
  usePostCommentMutation,
  useDeleteCommentMutation,
  useReportFeedMutation,
  useVotePollMutation,
  useGetFeedsQuery,
  useGetFeedByIdQuery,
  useGetMyFeedsQuery,
  useGetCommentsQuery,
  useGetReactsQuery,
  useGetWorkoutQuery,
  useGetMusclesQuery,
  useGetMuscleExerciseTypesQuery,
  useGetDashboardQuery,
  useGetSavedContentQuery,
  useGetVideosByWorkoutQuery,
  useGetVideoDetailsQuery,
  useSaveVideoMutation,
  // Consultation & Booking
  useGetAllDoctorsQuery,
  useGetAllTrainersQuery,
  useViewDoctorQuery,
  useGetServiceDetailsQuery,
  useGetServiceSlotsQuery,
  useBookAppointmentMutation,
  useGetMyBookingsQuery,
  useGetBookingDetailsQuery,
  useGetDoctorReviewsQuery,
  useApproveRescheduleMutation,
  useRejectRescheduleMutation,
  useCreateChatMutation,
  useCreateAdminChatMutation,
  useBlockUserMutation,
  useGetBlockedUsersQuery,
  useUnblockUserMutation,
  useRateBookingMutation,
  useReportBookingMutation,
  useGiveTipMutation,
  // Chat APIs
  useGetChatListQuery,
  useGetChatQuery,
  useSendMessageMutation,
  useGetUnreadChatsQuery,
  useGetWalletCoinsQuery,
  useTransferYallaCoinMutation,
  useBuyYallaCoinMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
  useConfirmPaymentMutation,
  useScanAvatarMutation,
  useUpdateAvatarMutation,
  useGetFaqsQuery,
  useContactUsMutation,
  // Challenges
  useGetChallengesQuery,
  useGetChallengeByIdQuery,
  useStartChallengeMutation,
  useStartTodayTaskMutation,
  useCompleteTodayTaskMutation,
  useLeaveChallengeMutation,
  useClaimChallengeRewardMutation,
  useGetChallengeLogsQuery,
  useDeleteAccountMutation,
  useGetCaloriesGraphQuery,
  useGetMonthlyBmiGraphQuery,
} = userApi;
