import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_API_PREFIX, API_USER_BASE_URL } from '../../../utils/data'
import { withTimezone } from '../../../utils/timezone'

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_USER_BASE_URL,
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
                body: withTimezone(body),
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
                body: withTimezone(body),
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
        verifyOtp: builder.mutation({
            query: (body: {
                email: string
                otp: string
                device_type: string
                device_token: string
            }) => ({
                url: `${API_BASE_API_PREFIX}/verify-otp`,
                method: "POST",
                body,
            }),
            transformResponse: (response: any, meta: any) => {
                meta.show_success = true
                meta.message =
                    response?.message || 'Email verified successfully.'
                return response
            },
        }),
        resendOtp: builder.mutation({
            query: (body: { email: string }) => ({
                url: `${API_BASE_API_PREFIX}/resend-otp`,
                method: "POST",
                body,
            }),
            transformResponse: (response: any, meta: any) => {
                meta.show_success = true
                meta.message =
                    response?.message ||
                    'We have sent a new verification code to your email.'
                return response
            },
        }),

    }),
})

export const {
    useLoginMutation,
    useSignupMutation,
    useForgotPasswordMutation,
    useVerifyMutation,
    useSetPasswordMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
} = authApi