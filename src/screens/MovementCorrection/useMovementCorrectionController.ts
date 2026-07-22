import { useCallback, useMemo } from 'react';
import * as Yup from 'yup';
import {
  useRecordWorkoutVideoViewMutation,
} from '../../redux/Apis/User';
import { useStartExerciseMutation } from '../../redux/Apis/MovementCorrection';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';

export type MovementExerciseOption = {
  label: string;
  value: number;
  exerciseKey: string;
};

export type MovementMode = 'single' | 'alternating' | 'bilateral';
export type MovementSelectedSide = 'left' | 'right';

type TData = {
  exercise_id: number | null;
  mode: MovementMode | null;
  selected_side: MovementSelectedSide | null;
};

const initial: TData = {
  exercise_id: null,
  mode: null,
  selected_side: null,
};

/** Exercises that require mode (+ selected_side when mode is single). */
export const MODE_EXERCISE_KEYS = new Set([
  'hammer_curl_rules',
  'shoulder_front_raise_rules',
]);

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
  { label: 'Hammer Curl', value: 6, exerciseKey: 'hammer_curl_rules' },
  {
    label: 'Shoulder Front Raise',
    value: 7,
    exerciseKey: 'shoulder_front_raise_rules',
  },
];

export const MOVEMENT_MODE_OPTIONS = [
  { label: 'Single', value: 'single' },
  { label: 'Alternating', value: 'alternating' },
  { label: 'Bilateral', value: 'bilateral' },
];

export const MOVEMENT_SIDE_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
];

export const exerciseNeedsMode = (exerciseId: number | null | undefined) => {
  if (exerciseId == null) return false;
  const selected = MOVEMENT_CORRECTION_EXERCISES.find(
    item => item.value === Number(exerciseId),
  );
  return Boolean(selected && MODE_EXERCISE_KEYS.has(selected.exerciseKey));
};

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
): string => response?.message?.trim() || fallback;

const buildMovementSchema = () =>
  Yup.object().shape({
    exercise_id: Yup.number()
      .typeError('Exercise is required')
      .required('Exercise is required'),
    mode: Yup.string()
      .nullable()
      .when('exercise_id', {
        is: (id: number) => exerciseNeedsMode(id),
        then: schema =>
          schema
            .oneOf(
              MOVEMENT_MODE_OPTIONS.map(o => o.value),
              'Please select a valid mode',
            )
            .required('Mode is required'),
        otherwise: schema => schema.nullable().notRequired(),
      }),
    selected_side: Yup.string()
      .nullable()
      .when(['exercise_id', 'mode'], {
        is: (id: number, mode: string) =>
          exerciseNeedsMode(id) && mode === 'single',
        then: schema =>
          schema
            .oneOf(
              MOVEMENT_SIDE_OPTIONS.map(o => o.value),
              'Please select a valid side',
            )
            .required('Selected side is required'),
        otherwise: schema => schema.nullable().notRequired(),
      }),
  });

const useMovementCorrectionController = () => {
  const { showOkModal } = useModal();
  const [recordView, { isLoading: isViewLoading }] =
    useRecordWorkoutVideoViewMutation();
  const [start, { isLoading: isStartLoading }] = useStartExerciseMutation();

  const schema = useMemo(() => buildMovementSchema(), []);

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

      const needsMode = MODE_EXERCISE_KEYS.has(selected.exerciseKey);
      const mode = needsMode ? data.mode : null;
      const selectedSide =
        needsMode && mode === 'single' ? data.selected_side : null;

      if (needsMode && !mode) {
        showOkModal({
          type: 'error',
          title: 'Error',
          message: 'Please select a mode.',
        });
        return;
      }

      if (needsMode && mode === 'single' && !selectedSide) {
        showOkModal({
          type: 'error',
          title: 'Error',
          message: 'Please select a side.',
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

        const startPayload: Record<string, string> = {
          exercise: selected.exerciseKey,
        };
        if (mode) {
          startPayload.mode = mode;
        }
        if (selectedSide) {
          startPayload.selected_side = selectedSide;
        }

        const startResponse = await start(
          JSON.stringify(startPayload),
        ).unwrap();

        if (startResponse?.status === 'started') {
          navigate('MovementCorrectionCamera', {
            session_id: String(startResponse?.session_id ?? ''),
            exercise: String(startResponse?.exercise ?? selected.exerciseKey),
            mode: mode ?? undefined,
            selected_side: selectedSide ?? undefined,
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
    schema,
    values: {
      initial,
      dropdown_data: MOVEMENT_CORRECTION_EXERCISES.map(({ label, value }) => ({
        label,
        value,
      })),
      mode_options: MOVEMENT_MODE_OPTIONS,
      side_options: MOVEMENT_SIDE_OPTIONS,
      isLoading: isViewLoading || isStartLoading,
    },
    functions: {
      onSubmit,
      exerciseNeedsMode,
    },
  };
};

export default useMovementCorrectionController;
