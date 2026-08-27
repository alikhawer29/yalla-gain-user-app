import {
  getPollOptionText,
  normalizePollOptionsForEdit,
} from './useEditPostController';

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

jest.mock('../../utils/navigation', () => ({
  goBack: jest.fn(),
}));

jest.mock('../../contexts/ModalContext', () => ({
  useModal: () => ({ showOkModal: jest.fn() }),
}));

jest.mock('../../hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../redux/Slices/AuthSlice', () => ({
  selectUser: jest.fn(),
}));

jest.mock('../../redux/Apis/User', () => ({
  useUpdateFeedMutation: () => [jest.fn(), { isLoading: false }],
}));

jest.mock('../../utils/feedMediaValidation', () => ({
  filterValidFeedMediaAssets: jest.fn(),
  validateFeedMediaItemsForUpload: jest.fn(),
}));

describe('getPollOptionText', () => {
  it('reads option_text from API poll options when text is missing', () => {
    expect(
      getPollOptionText({ id: 1, option_text: 'Yes' }),
    ).toBe('Yes');
  });

  it('does not throw when text is undefined', () => {
    expect(() =>
      getPollOptionText({ id: 1, option_text: 'Option A' }),
    ).not.toThrow();
  });

  it('treats whitespace-only options as empty', () => {
    expect(getPollOptionText({ text: '   ' })).toBe('');
    expect(getPollOptionText({ option_text: '   ' })).toBe('');
  });
});

describe('normalizePollOptionsForEdit', () => {
  it('maps API poll options onto the form text field', () => {
    expect(
      normalizePollOptionsForEdit([
        { id: 10, option_text: 'Option A' },
        { poll_option_id: 11, option_text: 'Option B' },
      ]),
    ).toEqual([
      { id: 10, text: 'Option A' },
      { id: 11, text: 'Option B' },
    ]);
  });

  it('filters valid API poll options without throwing', () => {
    const options = normalizePollOptionsForEdit([
      { id: 1, option_text: 'Yes' },
      { id: 2, option_text: 'No' },
      { id: 3, option_text: '   ' },
    ]);

    expect(options.filter(opt => getPollOptionText(opt))).toEqual([
      { id: 1, text: 'Yes' },
      { id: 2, text: 'No' },
    ]);
  });
});
