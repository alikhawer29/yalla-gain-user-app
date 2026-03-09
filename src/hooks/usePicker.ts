import { useState } from 'react';
import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { openImageCamera, openImageGallery } from '../utils/picker';
import useToggle from './useToggle';

const requestCameraPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      let entity =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      const permission = await check(entity);

      if (permission !== RESULTS.GRANTED) {
        let granted = await request(entity);
        if (granted === RESULTS.GRANTED) {
          return true;
        } else {
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  } catch (err) {
    console.warn(err);
  }
};

const requestGalleryPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      let entity =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.IOS.PHOTO_LIBRARY;

      const permission = await check(entity);

      if (permission !== RESULTS.GRANTED) {
        let granted = await request(entity);
        if (granted === RESULTS.GRANTED) {
          return true;
        } else {
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  } catch (err) {
    console.warn(err);
  }
};

const usePicker = () => {
  const [toggleModal, modalOpen] = useToggle();
  const [image, setImage] = useState<any>(null);

  const openCamera = async () => {
    let permitted = await requestCameraPermission();

    if (permitted) {
      toggleModal();
      openImageCamera(setImage);
    }
  };

  const openGallery = async () => {
    let permitted = await requestGalleryPermission();

    if (permitted) {
      // toggleModal()
      openImageGallery(setImage);
    }
  };

  return {
    image,
    setImage,
    modalOpen,
    toggleModal,
    openCamera,
    openGallery,
  };
};

export default usePicker;
