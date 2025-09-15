import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const movementCorrectionApi = createApi({
    reducerPath: 'movementCorrectionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://yalla-ai.onlinetestingserver.com/v1/exercise/',
        prepareHeaders: (headers, { }) => {
            headers.set('Accept', `application/json`)
            return headers
        }
    }),
    endpoints: (builder) => ({
        startExercise: builder.mutation({
            query: (body) => ({
                url: `start`,
                method: "POST",
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: "application/json"
                }
            }),
        }),
        stopExercise: builder.mutation({
            query: (params) => ({
                url: `stop`,
                method: "POST",
                params,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: "application/json"
                }
            }),
        }),
    }),
})

export const {
    useStartExerciseMutation,
    useStopExerciseMutation
} = movementCorrectionApi 