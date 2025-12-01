import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../Store';

export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: [
    'SavedContent',
    'VideoDetails',
    'WorkoutVideos',
    'Bookings',
    'Consultants',
  ],
  baseQuery: fetchBaseQuery({
    baseUrl:
      'https://custom-dev.onlinetestingserver.com/yalla-backend/api/user/',
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
    }),
    updateFeed: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/update`,
        method: 'POST',
        body,
      }),
    }),
    deleteFeed: builder.mutation({
      query: id => ({
        url: `post/${id}/delete`,
        method: 'POST',
      }),
    }),
    reactFeed: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/react`,
        method: 'POST',
        body,
      }),
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
    }),
    deleteComment: builder.mutation({
      query: id => ({
        url: `comment/${id}/remove`,
        method: 'POST',
      }),
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
        url: `post/${post_id}/${option_id}/report`,
        method: 'POST',
      }),
    }),
    getFeeds: builder.query({
      query: query => ({
        url: query?.user_id ? `posts/${query?.user_id}` : `posts`,
        method: 'GET',
        query,
      }),
    }),
    getFeedById: builder.query({
      query: id => ({
        url: `post/${id}`,
        method: 'GET',
      }),
    }),
    getMyFeeds: builder.query({
      query: () => ({
        url: `posts/my/get`,
        method: 'GET',
      }),
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
      query: params => ({
        url: `workout-contents`,
        method: 'GET',
        params,
      }),
    }),
    getVideosByWorkout: builder.query({
      query: data => ({
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
      invalidatesTags: ['Bookings'],
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
      providesTags: ['Bookings'],
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
  useRateBookingMutation,
  useReportBookingMutation,
} = userApi;
