const getPollVotesTotal = (options: any[]) =>
  options.reduce((sum, opt) => sum + (Number(opt?.votes) || 0), 0);

/** Prefer fresher counts; never regress after the user has voted (stale feed refetch). */
export const mergePollOptionsFromFeed = (
  previous: any[],
  incoming: any[],
  userHasVoted: boolean,
) => {
  if (!incoming.length) {
    return previous;
  }
  if (!previous.length) {
    return incoming;
  }
  if (userHasVoted && getPollVotesTotal(incoming) < getPollVotesTotal(previous)) {
    return previous;
  }
  return incoming;
};
