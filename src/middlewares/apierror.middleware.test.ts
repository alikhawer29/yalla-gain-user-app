import Toast from 'react-native-toast-message';
import errorLogger from './apierror.middleware';

jest.mock('@reduxjs/toolkit', () => ({
  isRejectedWithValue: () => true,
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

const NO_INTERNET_MESSAGE =
  'No internet connection. Please check your network and try again.';

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
});
