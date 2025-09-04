import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../../Store'

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://custom-dev.onlinetestingserver.com/yalla-backend/api/user/',
        prepareHeaders: (headers, { getState }) => {

            const state = getState() as RootState
            const token = state?.auth?.token

            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }

            headers.set('Accept', `application/json`)
            return headers

        }
    }),
    endpoints: (builder) => ({
        changePassword: builder.mutation({
            query: (body) => ({
                url: `change-password`,
                method: "POST",
                body
            }),
        }),
        getSubscriptionPlans: builder.query({
            query: () => ({
                url: `plans`,
                method: "GET",
            }),
            keepUnusedDataFor: 0
        }),
        getSubscriptionLogs: builder.query({
            query: () => ({
                url: `subscription-logs`,
                method: "GET",
            }),
            keepUnusedDataFor: 0
        }),
        subscribe: builder.mutation({
            query: (body) => ({
                url: `payment`,
                method: "POST",
                body
            }),
        }),
        cancelSubscription: builder.mutation({
            query: (id) => ({
                url: `subscription/${id}/cancel`,
                method: "POST",
            }),
        }),
        // Newsfeed
        createFeed: builder.mutation({
            query: (body) => ({
                url: `post`,
                method: "POST",
                body
            }),
        }),
        updateFeed: builder.mutation({
            query: ({ id, body }) => ({
                url: `post/${id}/update`,
                method: "POST",
                body
            }),
        }),
        deleteFeed: builder.mutation({
            query: (id) => ({
                url: `post/${id}/delete`,
                method: "POST",
            }),
        }),
        reactFeed: builder.mutation({
            query: ({ id, body }) => ({
                url: `post/${id}/react`,
                method: "POST",
                body
            }),
        }),
        reactComment: builder.mutation({
            query: ({ id, body }) => ({
                url: `comment/${id}/react`,
                method: "POST",
                body
            }),
        }),
        postComment: builder.mutation({
            query: ({ id, body }) => ({
                url: `post/${id}/comment`,
                method: "POST",
                body
            }),
        }),
        deleteComment: builder.mutation({
            query: (id) => ({
                url: `comment/${id}/remove`,
                method: "POST",
            }),
        }),
        reportFeed: builder.mutation({
            query: ({ id, body }) => ({
                url: `post/${id}/report`,
                method: "POST",
                body
            }),
        }),
        votePoll: builder.mutation({
            query: ({ post_id, option_id }) => ({
                url: `post/${post_id}/${option_id}/report`,
                method: "POST",
            }),
        }),
        getFeeds: builder.query({
            query: (query) => ({
                url: query?.user_id ? `posts/${query?.user_id}` : `posts`,
                method: "GET",
                query
            }),
        }),
        getFeedById: builder.query({
            query: (id) => ({
                url: `post/${id}`,
                method: "GET",
            }),
        }),
        getMyFeeds: builder.query({
            query: () => ({
                url: `posts/my/get`,
                method: "GET",
            }),
        }),
        getComments: builder.query({
            query: (id) => ({
                url: `post/${id}/comments`,
                method: "GET",
            }),
        }),
        getReacts: builder.query({
            query: (id) => ({
                url: `post/${id}/reacted`,
                method: "GET",
            }),
        }),
        // workout
        saveVideo: builder.mutation({
            query: (id) => ({
                url: `video/${id}/save`,
                method: "POST",
            }),
        }),
        getSavedContent: builder.query({
            query: (params) => ({
                url: `saved/videos`,
                method: "GET",
                params
            }),
        }),
        getWorkout: builder.query({
            query: () => ({
                url: `workout-contents`,
                method: "GET",
            }),
        }),
        getVideosByWorkout: builder.query({
            query: (id) => ({
                url: `workout-content/${id}/videos`,
                method: "GET",
            }),
        }),
        getVideoDetails: builder.query({
            query: (id) => ({
                url: `video/${id}`,
                method: "GET",
            }),
        }),
    }),
})

export const {
    useChangePasswordMutation,
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
} = userApi