import { useEffect } from 'react';
import { useStartExerciseMutation } from '../../redux/Apis/MovementCorrection';
import { navigate } from '../../utils/navigation';
import { EXERCISE_SCHEMA } from '../../utils/validators';

type TData = {
  exercise: string;
};

const initial: TData = {
  exercise: '',
};

/**
 * Movement Correction expects these exercise keys (sent to start-session).
 * Kept static — `workout-contents` items use different fields / keys, so filtering API rows returned nothing.
 */
const MOVEMENT_DROPDOWN_ITEMS = [
  { label: 'Barbell biceps curl', value: 'barbell biceps curl' },
  { label: 'Squat', value: 'squat' },
  { label: 'Push-up', value: 'push-up' },
  { label: 'Plank', value: 'plank' },
  { label: 'Deadlift', value: 'deadlift' },
];

const useMovementCorrectionController = () => {
  const [start, { data, isLoading, isSuccess }] = useStartExerciseMutation();

  useEffect(() => {
    if (isSuccess) {
      if (data?.status === 'started') {
        navigate('MovementCorrectionCamera', {
          session_id: String(data?.session_id ?? ''),
          exercise: String(data?.exercise ?? ''),
        });
      }
    }
  }, [isSuccess, data, isLoading]);

  const onSubmit = (data: TData) => {
    start(JSON.stringify(data));
  };

  return {
    schema: EXERCISE_SCHEMA,
    values: {
      initial,
      dropdown_data: [...MOVEMENT_DROPDOWN_ITEMS],
      isLoading,
    },
    functions: {
      onSubmit,
    },
  };
};

export default useMovementCorrectionController;
