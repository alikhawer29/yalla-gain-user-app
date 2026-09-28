import { mergePollOptionsFromFeed } from './pollOptions';

describe('mergePollOptionsFromFeed', () => {
  const voted = [
    { id: 1, option_text: 'A', votes: 3 },
    { id: 2, option_text: 'B', votes: 1 },
  ];
  const stale = [
    { id: 1, option_text: 'A', votes: 2 },
    { id: 2, option_text: 'B', votes: 1 },
  ];
  const fresh = [
    { id: 1, option_text: 'A', votes: 3 },
    { id: 2, option_text: 'B', votes: 2 },
  ];

  it('keeps optimistic counts when a stale feed refetch has fewer votes', () => {
    expect(mergePollOptionsFromFeed(voted, stale, true)).toEqual(voted);
  });

  it('accepts newer feed data when vote totals are equal or higher', () => {
    expect(mergePollOptionsFromFeed(voted, voted, true)).toEqual(voted);
    expect(mergePollOptionsFromFeed(voted, fresh, true)).toEqual(fresh);
  });

  it('always accepts incoming options before the user has voted', () => {
    expect(mergePollOptionsFromFeed(voted, stale, false)).toEqual(stale);
  });

  it('uses incoming options when local state is empty', () => {
    expect(mergePollOptionsFromFeed([], stale, true)).toEqual(stale);
  });
});
