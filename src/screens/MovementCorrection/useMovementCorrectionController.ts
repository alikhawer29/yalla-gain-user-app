import { useCallback } from 'react';
import {
  useRecordWorkoutVideoViewMutation,
} from '../../redux/Apis/User';
import { useStartExerciseMutation } from '../../redux/Apis/MovementCorrection';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { MOVEMENT_EXERCISE_SCHEMA } from '../../utils/validators';

export type MovementExerciseOption = {
  label: string;
  value: number;
  exerciseKey: string;
};

type TData = {
  exercise_id: number | null;
};

const initial: TData = {
  exercise_id: null,
};

/**
 * Movement Correction dropdown: `value` = backend exercise_id, `exerciseKey` = AI start-session.
 * Update `id` values to match your API exercise records.
 */
export const MOVEMENT_CORRECTION_EXERCISES: MovementExerciseOption[] = [
  { label: 'Barbell biceps curl', value: 1, exerciseKey: 'barbell biceps curl' },
  { label: 'Squat', value: 12, exerciseKey: 'squat' },
  { label: 'Push-up', value: 3, exerciseKey: 'push-up' },
  { label: 'Plank', value: 4, exerciseKey: 'plank' },
  { label: 'Deadlift', value: 5, exerciseKey: 'deadlift' },
];

type WorkoutVideoViewResponse = {
  status?: boolean;
  allowed?: boolean;
  message?: string;
  exercise_id?: number;
  can_open_exercise?: boolean;
};

const canOpenExercise = (response: WorkoutVideoViewResponse): boolean =>
  response.status === true &&
  response.allowed !== false &&
  response.can_open_exercise !== false;

const getViewMessage = (
  response: WorkoutVideoViewResponse | undefined,
  fallback: string,
): string =>
  response?.message?.trim() || fallback;

const useMovementCorrectionController = () => {
  const { showOkModal } = useModal();
  const [recordView, { isLoading: isViewLoading }] =
    useRecordWorkoutVideoViewMutation();
  const [start, { isLoading: isStartLoading }] = useStartExerciseMutation();

  const onSubmit = useCallback(
    async (data: TData) => {
      const exerciseId = Number(data.exercise_id);
      const selected = MOVEMENT_CORRECTION_EXERCISES.find(
        item => item.value === exerciseId,
      );

      if (!selected) {
        showOkModal({
          type: 'error',
          title: 'Error',
          message: 'Please select a valid exercise.',
        });
        return;
      }

      try {
        const viewResponse = (await recordView({
          exercise_id: exerciseId,
        }).unwrap()) as WorkoutVideoViewResponse;

        if (!canOpenExercise(viewResponse)) {
          showOkModal({
            type: 'info',
            title: 'Notice',
            message: getViewMessage(
              viewResponse,
              'You cannot open this exercise right now.',
            ),
          });
          return;
        }

        const startResponse = await start(
          JSON.stringify({ exercise: selected.exerciseKey }),
        ).unwrap();

        if (startResponse?.status === 'started') {
          navigate('MovementCorrectionCamera', {
            session_id: String(startResponse?.session_id ?? ''),
            exercise: String(startResponse?.exercise ?? selected.exerciseKey),
          });
          return;
        }

        showOkModal({
          type: 'error',
          title: 'Error',
          message: 'Could not start the exercise session. Please try again.',
        });
      } catch (error: any) {
        const payload = error?.data as WorkoutVideoViewResponse | undefined;
        showOkModal({
          type: payload?.status === false ? 'info' : 'error',
          title: payload?.status === false ? 'Notice' : 'Error',
          message:
            getViewMessage(
              payload,
              'Something went wrong. Please try again.',
            ) ||
            error?.data?.error ||
            'Something went wrong. Please try again.',
        });
      }
    },
    [recordView, start, showOkModal],
  );

  return {
    schema: MOVEMENT_EXERCISE_SCHEMA,
    values: {
      initial,
      dropdown_data: MOVEMENT_CORRECTION_EXERCISES.map(({ label, value }) => ({
        label,
        value,
      })),
      isLoading: isViewLoading || isStartLoading,
    },
    functions: {
      onSubmit,
    },
  };
};

export default useMovementCorrectionController;
