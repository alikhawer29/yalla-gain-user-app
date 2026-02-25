import * as Yup from "yup"

export const LOGIN_SCHEMA = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
})

export const SIGNUP_SCHEMA = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
    dialing_code: Yup.string(),
    country_code: Yup.string(),
    phone: Yup.string()
        .required('Mobile Number is required')
        .min(6, 'Phone number must be 6–15 digits')
        .max(15, 'Phone number must be 6–15 digits'),
})

export const EDIT_PROFILE_SCHEMA = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    dialing_code: Yup.string(),
    country_code: Yup.string(),
    phone: Yup.string()
        .required('Mobile Number is required')
        .min(6, 'Phone number must be 6–15 digits')
        .max(15, 'Phone number must be 6–15 digits'),
    dob: Yup.string().test(
        'not-future',
        'Date of birth must be in the past (not today or future)',
        (value) => {
            if (!value) return true
            const d = new Date(value)
            if (Number.isNaN(d.getTime())) return true
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return d < today
        }
    ),
})

export const FORGOT_PASSWORD_SCHEMA = Yup.object().shape({
    via: Yup.string().oneOf(['email', 'phone']).required('Method is required'),
    email: Yup.string().when('via', {
        is: 'email',
        then: schema => schema.required('Email is required').email('Invalid email'),
        otherwise: schema => schema.notRequired(),
    }),
    phone: Yup.string().when('via', {
        is: 'phone',
        then: schema =>
            schema
                .required('Phone is required')
                .min(6, 'Phone number must be 6–15 digits')
                .max(15, 'Phone number must be 6–15 digits'),
        otherwise: schema => schema.notRequired(),
    }),
    dialing_code: Yup.string().when('via', {
        is: 'phone',
        then: schema => schema.required('Dialing code is required'),
        otherwise: schema => schema.notRequired(),
    }),
})

export const VERIFY_CODE_SCHEMA = Yup.object().shape({
    token: Yup.string().required('Verification Code is required').length(4, "Verification Code must be 4 digit")
})

export const SET_PASSWORD_SCHEMA = Yup.object().shape({
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
})

export const CHANGE_PASSWORD_SCHEMA = Yup.object().shape({
    old_password: Yup.string()
        .required('Current Password is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New Password is required'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
})

export const CREATE_POST_SCHEMA = Yup.object().shape({
    title: Yup.string()
})

export const EXERCISE_SCHEMA = Yup.object().shape({
    exercise: Yup.string().required('Exercise is required')
})