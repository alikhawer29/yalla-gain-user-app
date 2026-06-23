import { useEffect } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { registerForceLogoutModalHandler } from '../../utils/forceLogoutModalBridge';

const ForceLogoutListener = () => {
  const { showOkModal } = useModal();

  useEffect(() => {
    return registerForceLogoutModalHandler(({ title, message }) => {
      showOkModal({
        type: 'warning',
        title,
        message,
        okText: 'OK',
      });
    });
  }, [showOkModal]);

  return null;
};

export default ForceLogoutListener;
