import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useModal } from '../../contexts/ModalContext';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { useScanAvatarMutation } from '../../redux/Apis/User';
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
    .min(1, 'Weight must be at least 1 gram'),
  height: Yup.number()
    .required('Height is required')
    .min(1, 'Height must be at least 1 cm'),
});

const useAvatarScanFormController = () => {
  const user = useAppSelector(selectUser);
  const formik_ref = useRef(null);
  const { showOkModal } = useModal();
  const route = useRoute();
  const { formData: routeFormData } = (route.params as any) || {};

  const [submit, { isLoading, isSuccess }] = useScanAvatarMutation();
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [isLoadingScan, setIsLoadingScan] = useState(false);

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
    if (isSuccess) {
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

  // Handle Manual button - submit without photos
  const onManualSubmit = useCallback(
    async (data: any) => {
      setIsLoadingManual(true);
      try {
        const formData = new FormData();

        // Add user_id
        formData.append('user_id', String(user?.id));

        // Add form fields
        formData.append('age', String(data.age));
        formData.append('gender', data.gender);
        formData.append('height', String(data.height));
        formData.append('weight', String(data.weight));
        formData.append('scan', 'false'); // Manual mode - scan is false

        await submit(formData).unwrap();
        // Navigation to Unity game will happen via useEffect when isSuccess is true
      } catch (error: any) {
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

  // Handle Scan button - navigate to Scan screen with form data
  const onScanPress = useCallback(
    (data: any) => {
      setIsLoadingScan(true);
      navigate(ROUTES.SCAN, {
        formData: data,
      });
      // Reset loading after navigation
      setTimeout(() => setIsLoadingScan(false), 100);
    },
    [],
  );


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
    },
  };
};

export default useAvatarScanFormController;
