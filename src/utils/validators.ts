import * as Yup from 'yup';

export const LOGIN_SCHEMA = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const SIGNUP_SCHEMA = Yup.object().shape({
  first_name: Yup.string()
    .trim()
    .required('First Name is required')
    .min(2, 'First Name must be at least 2 characters')
    .max(50, 'First Name must be at most 50 characters')
    .matches(
      /^[A-Za-z][A-Za-z\s.'-]*$/,
      'First Name can only contain letters, spaces, dots, hyphens and apostrophes',
    )
    .test(
      'no-consecutive-spaces',
      'First Name cannot contain consecutive spaces',
      value => !/\s{2,}/.test(value || ''),
    )
    .test(
      'no-leading-trailing-spaces',
      'First Name cannot start or end with spaces',
      value => value === value?.trim(),
    ),
  last_name: Yup.string()
    .trim()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters')
    .max(50, 'Last Name must be at most 50 characters')
    .matches(
      /^[A-Za-z][A-Za-z\s.'-]*$/,
      'Last Name can only contain letters, spaces, dots, hyphens and apostrophes',
    )
    .test(
      'no-consecutive-spaces',
      'Last Name cannot contain consecutive spaces',
      value => !/\s{2,}/.test(value || ''),
    )
    .test(
      'no-leading-trailing-spaces',
      'Last Name cannot start or end with spaces',
      value => value === value?.trim(),
    ),
  email: Yup.string()
    .trim()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters')
    .test(
      'no-consecutive-dots',
      'Email cannot contain consecutive dots',
      value => !/\.{2,}/.test(value || ''),
    )
    .test('valid-domain', 'Email must have a valid domain', value => {
      if (!value) return false;
      const parts = value.split('@');
      return parts.length === 2 && parts[1].includes('.');
    }),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    )
    .test(
      'no-common-passwords',
      'Password cannot be a common password',
      value => {
        const commonPasswords = [
          'password',
          '123456',
          'qwerty',
          'admin',
          'letmein',
          'welcome',
        ];
        return !commonPasswords.some(common =>
          value?.toLowerCase().includes(common.toLowerCase()),
        );
      },
    ),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  dialing_code: Yup.string(),
  country_code: Yup.string(),
  phone: Yup.string()
    .trim()
    .required('Mobile Number is required')
    .test('phone-digits-length', 'Phone number must be 6–15 digits', value => {
      const digits = (value || '').replace(/\D/g, '');
      return digits.length >= 6 && digits.length <= 15;
    })
    .test(
      'no-invalid-chars',
      'Phone number can only contain digits, spaces, hyphens, and parentheses',
      value => /^[0-9\s\-\(\)]+$/.test(value || ''),
    )
    .test(
      'not-all-same-digits',
      'Phone number cannot consist of the same digit repeated',
      value => {
        const digits = (value || '').replace(/\D/g, '');
        return !/^(.)\1+$/.test(digits);
      },
    ),
  dob: Yup.string()
    .required('Date of Birth is required')
    .test('valid-date', 'Please enter a valid Date of Birth', value => {
      if (!value) return false;
      const d = new Date(value);
      return !Number.isNaN(d.getTime());
    })
    .test(
      'not-future',
      'Please enter a valid Date of Birth. Future dates are not allowed, and you must be at least 18 years old to proceed.',
      value => {
        if (!value) return false;
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dob.setHours(0, 0, 0, 0);
        return dob < today;
      },
    )
    .test(
      'min-age-18',
      'Please enter a valid Date of Birth. Future dates are not allowed, and you must be at least 18 years old to proceed.',
      value => {
        if (!value) return false;
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) return false;
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        if (age > 18) return true;
        if (age === 18) {
          if (monthDiff > 0) return true;
          if (monthDiff === 0 && dayDiff >= 0) return true;
        }
        return false;
      },
    ),
});

export const EDIT_PROFILE_SCHEMA = Yup.object().shape({
  first_name: Yup.string()
    .trim()
    .required('First Name is required')
    .min(2, 'First Name must be at least 2 characters')
    .max(50, 'First Name must be at most 50 characters')
    .matches(
      /^[A-Za-z][A-Za-z\s.'-]*$/,
      'First Name contains invalid characters',
    ),
  last_name: Yup.string()
    .trim()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters')
    .max(50, 'Last Name must be at most 50 characters')
    .matches(
      /^[A-Za-z][A-Za-z\s.'-]*$/,
      'Last Name contains invalid characters',
    ),
  dialing_code: Yup.string(),
  country_code: Yup.string(),
  phone: Yup.string()
    .trim()
    .required('Mobile Number is required')
    .test('phone-digits-length', 'Phone number must be 6–15 digits', value => {
      const digits = (value || '').replace(/\D/g, '');
      return digits.length >= 6 && digits.length <= 15;
    }),
  dob: Yup.string()
    .test('valid-date', 'Please enter a valid Date of Birth', value => {
      if (!value) return true;
      const d = new Date(value);
      return !Number.isNaN(d.getTime());
    })
    .test(
      'not-future',
      'Please enter a valid Date of Birth. Future dates are not allowed, and you must be at least 18 years old to proceed.',
      value => {
        if (!value) return true;
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dob.setHours(0, 0, 0, 0);
        return dob < today;
      },
    )
    .test(
      'min-age-18',
      'Please enter a valid Date of Birth. Future dates are not allowed, and you must be at least 18 years old to proceed.',
      value => {
        if (!value) return true;
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) return false;
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        if (age > 18) return true;
        if (age === 18) {
          if (monthDiff > 0) return true;
          if (monthDiff === 0 && dayDiff >= 0) return true;
        }
        return false;
      },
    ),
});

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
});

export const VERIFY_CODE_SCHEMA = Yup.object().shape({
  token: Yup.string()
    .required('Verification Code is required')
    .length(4, 'Verification Code must be 4 digit'),
});

export const SET_PASSWORD_SCHEMA = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const CHANGE_PASSWORD_SCHEMA = Yup.object().shape({
  old_password: Yup.string()
    .required('Current Password is required')
    .min(8, 'Current Password must be at least 8 characters')
    .max(128, 'Current Password must be at most 128 characters'),
  password: Yup.string()
    .required('New Password is required')
    .min(8, 'New Password must be at least 8 characters')
    .max(128, 'New Password must be at most 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'New Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    )
    .test(
      'no-common-passwords',
      'New Password cannot be a common password',
      value => {
        const commonPasswords = [
          'password',
          '123456',
          'qwerty',
          'admin',
          'letmein',
          'welcome',
        ];
        return !commonPasswords.some(common =>
          value?.toLowerCase().includes(common.toLowerCase()),
        );
      },
    )
    .test(
      'not-same-as-old',
      'New Password must be different from current password',
      function (value) {
        return value !== this.parent.old_password;
      },
    ),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required')
    .min(8, 'Confirm Password must be at least 8 characters')
    .max(128, 'Confirm Password must be at most 128 characters'),
});

export const CREATE_POST_SCHEMA = Yup.object().shape({
  title: Yup.string(),
});

export const EXERCISE_SCHEMA = Yup.object().shape({
  exercise: Yup.string().required('Exercise is required'),
});
