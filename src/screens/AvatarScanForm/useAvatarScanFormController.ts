import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useModal } from '../../contexts/ModalContext';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { useScanAvatarMutation } from '../../redux/Apis/User';
import images from '../../assets/images';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import * as Yup from 'yup';

const AVATAR_SCAN_FORM_SCHEMA = Yup.object().shape({
  age: Yup.number()
    .required('Age is required')
    .min(1, 'Age must be at least 1')
    .max(150, 'Age must be less than 150'),
  gender: Yup.string()
    .oneOf(['male', 'female'], 'Gender must be selected')
    .required('Gender is required'),
  weight: Yup.number()
    .required('Weight is required')
    .min(1, 'Weight must be at least 1 kg'),
  height: Yup.number()
    .required('Height is required')
    .min(1, 'Height must be at least 1 cm'),
});

const useAvatarScanFormController = () => {
  const user = useAppSelector(selectUser);
  const formik_ref = useRef(null);
  const { showOkModal, showYesNoModal } = useModal();
  const route = useRoute();
  const { formData: routeFormData } = (route.params as any) || {};

  const [submit, { isLoading, isSuccess, reset }] = useScanAvatarMutation();
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [isLoadingScan, setIsLoadingScan] = useState(false);
  // Only navigate to Unity when we just completed a Manual submit on this screen.
  // (Scan flow navigates from Scan screen.) Stale isSuccess from a previous visit must not trigger navigation.
  const didManualSubmitRef = useRef(false);

  // On every focus: clear mutation state and "just submitted" flag so opening the form again
  // (or returning from Unity) never auto-navigates to Unity. Empty deps = stable callback, run only on focus.
  useFocusEffect(
    useCallback(() => {
      didManualSubmitRef.current = false;
      reset();
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const initial = routeFormData || {
    age: '',
    gender: '',
    body_type: '',
    weight: '',
    height: '',
  };

  // Check if we should show action buttons (Manual/Scan) or Next button
  // Show action buttons if no route form data (meaning we're starting fresh)
  const showActionButtons = !routeFormData;

  useEffect(() => {
    if (isSuccess && didManualSubmitRef.current) {
      didManualSubmitRef.current = false;
      navigate(ROUTES.CREATE_AVATAR);
    }
  }, [isSuccess]);

  // onSubmit is kept for Formik but should not be called in the new flow
  // Scan flow submits directly from Scan screen, Manual flow uses onManualSubmit
  const onSubmit = useCallback(
    async (data: any) => {
      // This should not be called in the new flow
      // If it is called, show an error
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please use Manual or Scan button to proceed.',
      });
    },
    [showOkModal],
  );

  const performManualSubmit = useCallback(
    async (data: any) => {
      didManualSubmitRef.current = true;
      setIsLoadingManual(true);
      try {
        const formData = new FormData();

        formData.append('user_id', String(user?.id));
        formData.append('age', String(data.age));
        formData.append('gender', data.gender);
        formData.append('height', String(data.height));
        formData.append('weight', String(data.weight));
        formData.append('scan', 'false');

        await submit(formData).unwrap();
      } catch (error: any) {
        didManualSubmitRef.current = false;
        showOkModal({
          type: 'error',
          title: 'Error',
          message:
            error?.data?.message ||
            'Failed to submit data. Please try again.',
        });
      } finally {
        setIsLoadingManual(false);
      }
    },
    [user, submit, showOkModal],
  );

  /** Manual: show precautions first; API + Unity only after user confirms. */
  const onManualSubmit = useCallback(
    (data: any) => {
      showYesNoModal(
        {
          type: 'warning',
          title: 'Precautions',
          message:
            'Before proceeding, please ensure all measurements are correct, as you will not be able to edit the avatar for the next one week after proceeding.',
          yesText: 'Next',
          noText: 'Cancel',
        },
        () => {
          performManualSubmit(data);
        },
        () => {},
      );
    },
    [showYesNoModal, performManualSubmit],
  );

  /** Scan: show gender illustration + precautions, then existing navigate to Scan screen. */
  const onScanPress = useCallback(
    (data: any) => {
      const illustrationSource =
        data.gender === 'female' ? images.female_scan : images.male_scan;
      showOkModal(
        {
          type: 'success',
          title: '',
          message:
            'Before scanning, carefully review the precautions to understand how to properly take the pictures.',
          illustrationSource,
        },
        () => {
          setIsLoadingScan(true);
          navigate(ROUTES.SCAN, {
            formData: data,
          });
          setTimeout(() => setIsLoadingScan(false), 100);
        },
      );
    },
    [showOkModal],
  );

  // Manual validation against schema - true only when form is valid
  const isFormValid = useCallback((values: any) => {
    try {
      AVATAR_SCAN_FORM_SCHEMA.validateSync(values);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    schema: AVATAR_SCAN_FORM_SCHEMA,
    refs: {
      formik_ref,
    },
    values: {
      initial,
      isLoading,
      isLoadingManual,
      isLoadingScan,
      showActionButtons,
    },
    functions: {
      onSubmit,
      onManualSubmit,
      onScanPress,
      isFormValid,
    },
  };
};

export default useAvatarScanFormController;
