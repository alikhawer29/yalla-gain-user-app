import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  refreshConsultationRealtimeUserId,
  startConsultationRealtimeSync,
  stopConsultationRealtimeSync,
} from '../services/consultationRealtime';
import { selectLoggedIn, selectUser } from '../redux/Slices/AuthSlice';

/**
 * Connects Socket.IO consultation sync while the user is logged in.
 */
export default function ConsultationRealtimeBootstrap() {
  const isLoggedIn = useSelector(selectLoggedIn);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!isLoggedIn) {
      stopConsultationRealtimeSync();
      return;
    }
    const stop = startConsultationRealtimeSync();
    refreshConsultationRealtimeUserId(user?.id);
    return () => {
      stop();
    };
  }, [isLoggedIn, user?.id]);

  return null;
}
