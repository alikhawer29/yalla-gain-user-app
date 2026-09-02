import { countryFlagEmoji, countryFlagImageUri, formatPhoneDisplay } from './helper';

describe('countryFlagEmoji', () => {
  it('returns a regional-indicator flag for a valid ISO country code', () => {
    expect(countryFlagEmoji('AE')).toBe('🇦🇪');
    expect(countryFlagEmoji('pk')).toBe('🇵🇰');
  });

  it('returns empty when the country code is missing or invalid', () => {
    expect(countryFlagEmoji('')).toBe('');
    expect(countryFlagEmoji('AEE')).toBe('');
    expect(countryFlagEmoji(null)).toBe('');
  });
});

describe('countryFlagImageUri', () => {
  it('returns a PNG uri Android can render', () => {
    expect(countryFlagImageUri('AE')).toBe('https://flagcdn.com/w40/ae.png');
    expect(countryFlagImageUri('pk')).toBe('https://flagcdn.com/w40/pk.png');
  });

  it('returns empty when the country code is missing or invalid', () => {
    expect(countryFlagImageUri('')).toBe('');
    expect(countryFlagImageUri('AEE')).toBe('');
    expect(countryFlagImageUri(null)).toBe('');
  });
});

describe('formatPhoneDisplay', () => {
  it('shows flag, plus-prefixed country code, and local number', () => {
    expect(formatPhoneDisplay('971', '501234567', 'AE')).toBe(
      '🇦🇪 (+971) 501234567',
    );
  });

  it('keeps an existing plus on the dialing code', () => {
    expect(formatPhoneDisplay('+92', '3001234567', 'PK')).toBe(
      '🇵🇰 (+92) 3001234567',
    );
  });

  it('omits the flag when country is unknown but still prefixes the code', () => {
    expect(formatPhoneDisplay('971', '501234567')).toBe('(+971) 501234567');
  });

  it('returns empty when there is no local number', () => {
    expect(formatPhoneDisplay('+971', '  ', 'AE')).toBe('');
  });
});
