jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    reset: jest.fn(),
    goBack: jest.fn(),
    navigate: jest.fn(),
  },
  createNavigationContainerRef: () => ({
    isReady: () => false,
    dispatch: jest.fn(),
    navigate: jest.fn(),
  }),
}));

import { getDrawerChallengesResetState } from './navigation';
import { NAVIGATORS, ROUTES } from './routes';

type NestedState = {
  index?: number;
  routes: Array<{ name: string; state?: NestedState }>;
};

function findNavigatorState(
  state: NestedState,
  name: string,
): NestedState | undefined {
  for (const route of state.routes) {
    if (route.name === name && route.state) {
      return route.state;
    }
    if (route.state) {
      const nested = findNavigatorState(route.state, name);
      if (nested) {
        return nested;
      }
    }
  }
  return undefined;
}

describe('getDrawerChallengesResetState', () => {
  it('keeps Home under Challenges so Android hardware back pops instead of exiting', () => {
    const resetState = getDrawerChallengesResetState();
    const homeStack = findNavigatorState(resetState, NAVIGATORS.HOME_STACK);

    expect(homeStack?.routes.map(route => route.name)).toEqual([
      ROUTES.HOME,
      ROUTES.CHALLENGES,
    ]);
    expect(homeStack?.index).toBe(1);
  });
});
