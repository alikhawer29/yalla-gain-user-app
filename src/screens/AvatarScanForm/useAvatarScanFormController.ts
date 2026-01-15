import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useModal } from '../../contexts/ModalContext';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { useScanAvatarMutation } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import * as Yup from 'yup';
import { Platform } from 'react-native';
import { validatePhoto } from '../../utils/photoValidation';
import RNFS from 'react-native-fs';
import { optimizePhoto } from '../../utils/optimizePhoto';

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
  const { frontPhoto, rightPhoto } = (route.params as any) || {};

  const [submit, { isLoading, isSuccess }] = useScanAvatarMutation();

  const initial = {
    age: '',
    gender: '',
    body_type: '',
    weight: '',
    height: '',
  };

  useEffect(() => {
    if (isSuccess) {
      navigate(ROUTES.CREATE_AVATAR);
    }
  }, [isSuccess]);

  const onSubmit = useCallback(
    async (data: any) => {
      if (!frontPhoto || !rightPhoto) {
        showOkModal({
          type: 'error',
          title: 'Error',
          message:
            'Photos are missing. Please go back and capture photos again.',
        });
        return;
      }

      // Validate both photos before submission (check for critical errors only)
      const frontValidation = await validatePhoto(frontPhoto);
      const rightValidation = await validatePhoto(rightPhoto);

      // Filter out resolution-only errors (we'll allow those if aspect ratio is correct)
      const frontCriticalErrors = frontValidation.errors.filter(
        err => !err.includes('resolution') && !err.includes('Resolution'),
      );
      const rightCriticalErrors = rightValidation.errors.filter(
        err => !err.includes('resolution') && !err.includes('Resolution'),
      );

      if (frontCriticalErrors.length > 0 || rightCriticalErrors.length > 0) {
        const allErrors = [
          ...(frontCriticalErrors.length > 0
            ? ['Front Photo: ' + frontCriticalErrors.join(', ')]
            : []),
          ...(rightCriticalErrors.length > 0
            ? ['Right Photo: ' + rightCriticalErrors.join(', ')]
            : []),
        ];
        showOkModal({
          type: 'error',
          title: 'Photo Validation Failed',
          message:
            'One or more photos have critical issues:\n\n' +
            allErrors.join('\n\n') +
            '\n\nPlease go back and retake the photos.',
        });
        return;
      }

      try {
        const formData = new FormData();

        // Add user_id
        formData.append('user_id', String(user?.id));

        // Add form fields
        formData.append('age', String(data.age));
        formData.append('gender', data.gender);
        formData.append('height', String(data.height));
        formData.append('weight', String(data.weight));

        // Optimize both photos to meet backend requirements
        console.log('=== Optimizing Photos ===');
        let optimizedFrontPhoto: any = null;
        let optimizedRightPhoto: any = null;

        try {
          console.log('Optimizing front photo...');
          optimizedFrontPhoto = await optimizePhoto(frontPhoto, 'front');
          console.log(
            `Front photo optimized: ${optimizedFrontPhoto.width}×${
              optimizedFrontPhoto.height
            }, ${optimizedFrontPhoto.sizeMB.toFixed(2)}MB, Quality: ${
              optimizedFrontPhoto.quality
            }%`,
          );

          console.log('Optimizing right photo...');
          optimizedRightPhoto = await optimizePhoto(rightPhoto, 'right');
          console.log(
            `Right photo optimized: ${optimizedRightPhoto.width}×${
              optimizedRightPhoto.height
            }, ${optimizedRightPhoto.sizeMB.toFixed(2)}MB, Quality: ${
              optimizedRightPhoto.quality
            }%`,
          );

          console.log('=== Optimized Photo Details ===');
          console.log(`Front Photo:`);
          console.log(
            `  - Resolution: ${optimizedFrontPhoto.width} × ${optimizedFrontPhoto.height}`,
          );
          console.log(
            `  - File Size: ${
              optimizedFrontPhoto.size
            } bytes (${optimizedFrontPhoto.sizeMB.toFixed(2)} MB)`,
          );
          console.log(`  - File Format: JPEG`);
          console.log(`  - Quality: ${optimizedFrontPhoto.quality}%`);
          if (optimizedFrontPhoto.savedPath) {
            console.log(
              `  - Saved for testing: ${optimizedFrontPhoto.savedPath}`,
            );
          }
          console.log(`Right Photo:`);
          console.log(
            `  - Resolution: ${optimizedRightPhoto.width} × ${optimizedRightPhoto.height}`,
          );
          console.log(
            `  - File Size: ${
              optimizedRightPhoto.size
            } bytes (${optimizedRightPhoto.sizeMB.toFixed(2)} MB)`,
          );
          console.log(`  - File Format: JPEG`);
          console.log(`  - Quality: ${optimizedRightPhoto.quality}%`);
          if (optimizedRightPhoto.savedPath) {
            console.log(
              `  - Saved for testing: ${optimizedRightPhoto.savedPath}`,
            );
          }
          console.log('===============================');
          console.log('');
          console.log('📁 ALL SAVED IMAGES FOR POSTMAN TESTING:');
          console.log('==========================================');
          if (optimizedFrontPhoto.savedPath) {
            console.log(
              `Front Photo (Optimized): ${optimizedFrontPhoto.savedPath}`,
            );
          }
          if (optimizedRightPhoto.savedPath) {
            console.log(
              `Right Photo (Optimized): ${optimizedRightPhoto.savedPath}`,
            );
          }
          console.log('==========================================');
        } catch (optimizationError: any) {
          showOkModal({
            type: 'error',
            title: 'Photo Optimization Error',
            message:
              optimizationError.message ||
              'Failed to optimize photos. Please try again.',
          });
          return;
        }

        // Use savedPath (which has .jpg extension) if available, otherwise use path
        // savedPath explicitly has .jpg extension for API compatibility
        const frontPhotoPath =
          optimizedFrontPhoto.savedPath || optimizedFrontPhoto.path;
        const rightPhotoPath =
          optimizedRightPhoto.savedPath || optimizedRightPhoto.path;

        const frontPhotoUri = frontPhotoPath?.startsWith('file://')
          ? frontPhotoPath
          : `file://${frontPhotoPath}`;

        const rightPhotoUri = rightPhotoPath?.startsWith('file://')
          ? rightPhotoPath
          : `file://${rightPhotoPath}`;

        // Ensure file names have .jpg extension for API
        const frontPhotoFile = {
          uri: frontPhotoUri,
          type: 'image/jpeg', // MIME type
          name: 'front_photo.jpg', // Explicit .jpg extension
        };

        const rightPhotoFile = {
          uri: rightPhotoUri,
          type: 'image/jpeg', // MIME type
          name: 'right_photo.jpg', // Explicit .jpg extension
        };

        formData.append('frontPhoto', frontPhotoFile as any);
        formData.append('rightPhoto', rightPhotoFile as any);

        // Log final payload info before sending
        console.log('=== API Payload Info (JPG Images) ===');
        console.log('User ID:', user?.id);
        console.log('Age:', data.age);
        console.log('Gender:', data.gender);
        console.log('Height:', data.height);
        console.log('Weight:', data.weight);
        console.log('Front Photo URI:', frontPhotoUri);
        console.log('Front Photo File Name:', frontPhotoFile.name);
        console.log('Front Photo MIME Type:', frontPhotoFile.type);
        console.log('Right Photo URI:', rightPhotoUri);
        console.log('Right Photo File Name:', rightPhotoFile.name);
        console.log('Right Photo MIME Type:', rightPhotoFile.type);
        console.log(`Front Photo:`);
        console.log(
          `  - Resolution: ${optimizedFrontPhoto.width} × ${optimizedFrontPhoto.height}`,
        );
        console.log(
          `  - File Size: ${
            optimizedFrontPhoto.size
          } bytes (${optimizedFrontPhoto.sizeMB.toFixed(2)} MB)`,
        );
        console.log(`  - File Format: JPEG`);
        console.log(`  - Quality: ${optimizedFrontPhoto.quality}%`);
        console.log(`Right Photo:`);
        console.log(
          `  - Resolution: ${optimizedRightPhoto.width} × ${optimizedRightPhoto.height}`,
        );
        console.log(
          `  - File Size: ${
            optimizedRightPhoto.size
          } bytes (${optimizedRightPhoto.sizeMB.toFixed(2)} MB)`,
        );
        console.log(`  - File Format: JPEG`);
        console.log(`  - Quality: ${optimizedRightPhoto.quality}%`);
        console.log('===========================================');

        await submit(formData).unwrap();
      } catch (error: any) {
        showOkModal({
          type: 'error',
          title: 'Error',
          message:
            error?.data?.message ||
            'Failed to submit scan data. Please try again.',
        });
      }
    },
    [frontPhoto, rightPhoto, user, submit, showOkModal],
  );

  return {
    schema: AVATAR_SCAN_FORM_SCHEMA,
    refs: {
      formik_ref,
    },
    values: {
      initial,
      isLoading,
      frontPhoto,
    },
    functions: {
      onSubmit,
    },
  };
};

export default useAvatarScanFormController;
