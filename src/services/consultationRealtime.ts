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

function onCatalogOrAppointment(): void {
  invalidateConsultationCaches();
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
  socket.on('realtimeSync', (payload: { event?: string }) => {
    const event = String(payload?.event || '');
    if (
      event === 'serviceCatalogUpdated' ||
      event === 'appointmentUpdated'
    ) {
      onCatalogOrAppointment();
    }
  });

  return () => stopConsultationRealtimeSync();
}

export function stopConsultationRealtimeSync(): void {
  started = false;
  if (socket) {
    socket.off('serviceCatalogUpdated', onCatalogOrAppointment);
    socket.off('appointmentUpdated', onCatalogOrAppointment);
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
