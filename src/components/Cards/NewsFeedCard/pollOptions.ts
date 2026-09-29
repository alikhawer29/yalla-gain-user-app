const toVoteCount = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const getPollVotesTotal = (options: any[]) =>
  options.reduce((sum, opt) => sum + toVoteCount(opt?.votes), 0);

const optionId = (option: any) =>
  option?.id ?? option?.poll_option_id;

/**
 * Prefer fresher counts; never regress after the user has voted (stale feed refetch).
 * Also keep local counts when totals match but the selected option would lose votes.
 */
export const mergePollOptionsFromFeed = (
  previous: any[],
  incoming: any[],
  userHasVoted: boolean,
  selectedOptionId?: string | number | null,
) => {
  if (!incoming.length) {
    return previous;
  }
  if (!previous.length) {
    return incoming;
  }

  if (!userHasVoted) {
    return incoming;
  }

  const prevTotal = getPollVotesTotal(previous);
  const nextTotal = getPollVotesTotal(incoming);

  if (nextTotal < prevTotal) {
    return previous;
  }

  if (
    selectedOptionId != null &&
    nextTotal === prevTotal
  ) {
    const prevSelected = previous.find(
      opt => String(optionId(opt)) === String(selectedOptionId),
    );
    const nextSelected = incoming.find(
      opt => String(optionId(opt)) === String(selectedOptionId),
    );
    if (
      toVoteCount(prevSelected?.votes) > toVoteCount(nextSelected?.votes)
    ) {
      return previous;
    }
  }

  return incoming;
};

/**
 * Largest-remainder percentages so option % always sum to 100 (no 33+33+33=99 flicker).
 */
export const getPollPercentages = (options: any[]): number[] => {
  const votes = options.map(opt => toVoteCount(opt?.votes));
  const total = votes.reduce((sum, v) => sum + v, 0);
  if (total <= 0) {
    return votes.map(() => 0);
  }

  const exact = votes.map(v => (v / total) * 100);
  const floored = exact.map(v => Math.floor(v));
  let remaining = 100 - floored.reduce((sum, v) => sum + v, 0);

  const byRemainder = exact
    .map((v, index) => ({ index, frac: v - floored[index] }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floored];
  for (let i = 0; i < byRemainder.length && remaining > 0; i += 1) {
    result[byRemainder[i].index] += 1;
    remaining -= 1;
  }

  return result;
};

export const bumpPollOptionVotes = (
  options: any[],
  optionIdToBump: string | number,
) =>
  options.map(opt => {
    const id = optionId(opt);
    const votes = toVoteCount(opt?.votes);
    return {
      ...opt,
      id,
      votes:
        String(id) === String(optionIdToBump) ? votes + 1 : votes,
    };
  });
