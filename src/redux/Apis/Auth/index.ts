import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://custom-dev.onlinetestingserver.com/yalla-backend/api/user/',
        prepareHeaders: (headers, { }) => {
            headers.set('Accept', `application/json`)
            return headers
        }
    }),
    endpoints: (builder) => ({
        signup: builder.mutation({
            query: (body) => ({
                url: `signup`,
                method: "POST",
                body,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            }),

        }),
        login: builder.mutation({
            query: (body) => ({
                url: `login`,
                method: "POST",
                body
            }),
        }),
        forgotPassword: builder.mutation({
            query: (body) => ({
                url: `reset/password`,
                method: "POST",
                body
            }),
            transformResponse: (response: any, meta: any) => {
                meta.show_success = true
                meta.message = "Verification code has been sent to your email."
                return response;
            }
        }),
        verify: builder.mutation({
            query: (body) => ({
                url: `verify/code`,
                method: "POST",
                body
            }),
        }),
        setPassword: builder.mutation({
            query: (body) => ({
                url: `set/password`,
                method: "POST",
                body
            }),
        }),

    }),
})

export const {
    useLoginMutation,
    useSignupMutation,
    useForgotPasswordMutation,
    useVerifyMutation,
    useSetPasswordMutation,
} = authApi