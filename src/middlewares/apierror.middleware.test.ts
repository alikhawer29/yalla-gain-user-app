import Toast from 'react-native-toast-message';
import errorLogger, {
  GENERIC_ERROR_MESSAGE,
  NO_INTERNET_MESSAGE,
  isSilentRejection,
} from './apierror.middleware';

jest.mock('@reduxjs/toolkit', () => ({
  isRejectedWithValue: () => true,
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

const dispatchError = (action: Record<string, unknown>) => {
  const next = jest.fn();
  errorLogger()(next)({
    type: 'userApi/executeQuery/rejected',
    meta: {
      requestId: 'req-1',
      requestStatus: 'rejected',
      rejectedWithValue: true,
    },
    error: { message: 'Rejected' },
    ...action,
  });
  return next;
};

describe('apierror middleware', () => {
  beforeEach(() => {
    jest.mocked(Toast.show).mockClear();
  });

  it('shows a clear no-internet message for FETCH_ERROR instead of Rejected', () => {
    dispatchError({
      payload: {
        status: 'FETCH_ERROR',
        error: 'TypeError: Network request failed',
      },
    });

    expect(Toast.show).toHaveBeenCalledWith({
      text1: 'Error!',
      text2: NO_INTERNET_MESSAGE,
      type: 'error',
    });
  });

  it('shows a clear no-internet message for TIMEOUT_ERROR', () => {
    dispatchError({
      payload: {
        status: 'TIMEOUT_ERROR',
        error: 'AbortError: TimeoutError: signal timed out',
      },
    });

    expect(Toast.show).toHaveBeenCalledWith({
      text1: 'Error!',
      text2: NO_INTERNET_MESSAGE,
      type: 'error',
    });
  });

  it('still shows the API error message for HTTP validation failures', () => {
    dispatchError({
      payload: {
        status: 422,
        data: { message: 'Email is already taken' },
      },
      error: { message: 'Rejected' },
    });

    expect(Toast.show).toHaveBeenCalledWith({
      text1: 'Error!',
      text2: 'Email is already taken',
      type: 'error',
    });
  });

  it('does not toast aborted requests as a network failure', () => {
    dispatchError({
      payload: {
        status: 'FETCH_ERROR',
        error: 'AbortError: The user aborted a request.',
      },
      meta: {
        requestId: 'req-1',
        requestStatus: 'rejected',
        rejectedWithValue: true,
        aborted: true,
      },
    });

    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('does not toast bare Rejected noise from cancelled navigation queries', () => {
    dispatchError({
      payload: undefined,
      error: { message: 'Rejected' },
    });

    expect(Toast.show).not.toHaveBeenCalled();
    expect(
      isSilentRejection({
        payload: undefined,
        error: { message: 'Rejected' },
        meta: {},
      }),
    ).toBe(true);
  });

  it('maps Rejected with a fetch status to a friendly offline message', () => {
    dispatchError({
      payload: {
        status: 'FETCH_ERROR',
        error: 'Rejected',
      },
      error: { message: 'Rejected' },
    });

    expect(Toast.show).toHaveBeenCalledWith({
      text1: 'Error!',
      text2: NO_INTERNET_MESSAGE,
      type: 'error',
    });
  });

  it('never surfaces the literal Rejected string for HTTP errors without a body', () => {
    dispatchError({
      payload: {
        status: 500,
        data: {},
      },
      error: { message: 'Rejected' },
    });

    expect(Toast.show).toHaveBeenCalledWith({
      text1: 'Error!',
      text2: GENERIC_ERROR_MESSAGE,
      type: 'error',
    });
  });
});
