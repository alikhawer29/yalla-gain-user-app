import { io, Socket } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '../utils/data';
import { store } from '../redux/Store';
import { userApi } from '../redux/Apis/User';

const SOCKET_SIGNATURE = '8lW8XtnPDVwHAdXCCoxRROvQUDtf9p2Zlt1HvJSm';

let socket: Socket | null = null;
let registeredUserId: string | number | null = null;
let started = false;

function invalidateConsultationCaches(): void {
  try {
    store.dispatch(
      userApi.util.invalidateTags(['Consultants', 'Bookings']),
    );
  } catch {
    // Store may not be ready during early boot.
  }
}

function patchFeedPostReaction(payload: {
  post_id?: string | number;
  reaction_count?: number;
  actor_id?: string | number | null;
  action?: string;
}): void {
  const postId = payload?.post_id;
  if (postId == null) return;

  const nextCount =
    payload.reaction_count != null ? Number(payload.reaction_count) : null;
  if (nextCount == null || Number.isNaN(nextCount)) return;

  // Own reactions are already applied optimistically + via mutation response.
  // Skipping avoids races that look like double-counts on like/unlike.
  try {
    const currentUserId = store.getState().auth?.user?.id;
    if (
      currentUserId != null &&
      payload.actor_id != null &&
      String(currentUserId) === String(payload.actor_id)
    ) {
      return;
    }
  } catch {
    // Continue with patch if auth state is unavailable.
  }

  const patchList = (draft: any) => {
    const posts = draft?.data;
    if (!Array.isArray(posts)) return;
    const index = posts.findIndex(
      (post: any) => String(post?.id) === String(postId),
    );
    if (index < 0) return;
    posts[index] = {
      ...posts[index],
      reaction_count: nextCount,
    };
  };

  try {
    for (let page = 1; page <= 10; page += 1) {
      store.dispatch(
        userApi.util.updateQueryData('getFeeds', { page }, patchList),
      );
      store.dispatch(
        userApi.util.updateQueryData('getMyFeeds', { page }, patchList),
      );
    }
    store.dispatch(userApi.util.updateQueryData('getFeeds', {}, patchList));
    store.dispatch(userApi.util.updateQueryData('getMyFeeds', {}, patchList));
    store.dispatch(
      userApi.util.updateQueryData('getFeedById', postId, (draft: any) => {
        if (!draft?.data) return;
        draft.data = {
          ...draft.data,
          reaction_count: nextCount,
        };
      }),
    );
    store.dispatch(
      userApi.util.invalidateTags([{ type: 'PostReactions', id: postId }]),
    );
  } catch {
    // Store may not be ready during early boot.
  }
}

function onCatalogOrAppointment(): void {
  invalidateConsultationCaches();
}

function onFeedPostReacted(payload: {
  post_id?: string | number;
  reaction_count?: number;
  actor_id?: string | number | null;
  event?: string;
}): void {
  patchFeedPostReaction(payload);
}

/**
 * Keeps consultants / bookings fresh when doctor creates services or either
 * side changes appointments (Socket.IO events from Laravel → Node broadcast).
 */
export function startConsultationRealtimeSync(): () => void {
  if (started) {
    return () => stopConsultationRealtimeSync();
  }
  started = true;

  try {
    const user = store.getState().auth?.user;
    registeredUserId = user?.id ?? null;
  } catch {
    registeredUserId = null;
  }

  socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    if (registeredUserId != null) {
      socket?.emit('sendUserId', {
        user_id: registeredUserId,
        signature: SOCKET_SIGNATURE,
      });
    }
  });

  socket.on('serviceCatalogUpdated', onCatalogOrAppointment);
  socket.on('appointmentUpdated', onCatalogOrAppointment);
  socket.on('feedPostReacted', onFeedPostReacted);
  socket.on('realtimeSync', (payload: { event?: string }) => {
    const event = String(payload?.event || '');
    if (
      event === 'serviceCatalogUpdated' ||
      event === 'appointmentUpdated'
    ) {
      onCatalogOrAppointment();
    }
    // feedPostReacted is handled by its dedicated listener — skip duplicate.
  });

  return () => stopConsultationRealtimeSync();
}

export function stopConsultationRealtimeSync(): void {
  started = false;
  if (socket) {
    socket.off('serviceCatalogUpdated', onCatalogOrAppointment);
    socket.off('appointmentUpdated', onCatalogOrAppointment);
    socket.off('feedPostReacted', onFeedPostReacted);
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/** Call after login when user id becomes available. */
export function refreshConsultationRealtimeUserId(
  userId?: string | number | null,
): void {
  registeredUserId = userId ?? null;
  if (socket?.connected && registeredUserId != null) {
    socket.emit('sendUserId', {
      user_id: registeredUserId,
      signature: SOCKET_SIGNATURE,
    });
  }
}
