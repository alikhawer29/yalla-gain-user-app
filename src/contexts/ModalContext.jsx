import React, { createContext, useContext, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import images from '../assets/images';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Text from '../components/Text';
import colors from '../utils/colors';
import { font, heightPixel, widthPixel } from '../utils/helper';
import Row from '../components/Row';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const [modalContent, setModalContent] = useState({
    type: 'success',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showOkModal = (data, onConfirm, onCancel) => {
    setModalType('ok');
    setModalContent({
      ...data,
      onConfirm: onConfirm ? onConfirm : () => setIsVisible(false),
      onCancel: () => {
        setIsVisible(false);
        if (onCancel) {
          onCancel();
        }
      },
    });
    setIsVisible(true);
  };

  const showYesNoModal = (data, onConfirm, onCancel) => {
    setModalType('yesNo');
    setModalContent({
      ...data,
      onConfirm,
      onCancel: onCancel ? onCancel : () => setIsVisible(false),
    });
    setIsVisible(true);
  };

  const showInformativeModal = (data, onConfirm, onCancel) => {
    setModalType('info');
    setModalContent({
      ...data,
      onConfirm,
      onCancel,
    });
    setIsVisible(true);
  };

  const showInputModal = (data, onConfirm, onCancel) => {
    setModalType('input');
    setInputValue('');
    setModalContent({
      ...data,
      onConfirm,
      onCancel: onCancel ? onCancel : () => setIsVisible(false),
    });
    setIsVisible(true);
  };

  const hideModal = () => {
    if (modalContent.onCancel) {
      modalContent.onCancel();
    }
    setIsVisible(false);
    setInputValue('');
  };

  return (
    <ModalContext.Provider
      value={{
        showOkModal,
        showYesNoModal,
        showInformativeModal,
        showInputModal,
        hideModal,
      }}
    >
      {children}
      {isVisible && (
        <Modal
          transparent
          visible={isVisible}
          animationType="fade"
          onRequestClose={hideModal}
          statusBarTranslucent
        >
          <TouchableWithoutFeedback onPress={hideModal} accessible={false}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  {modalContent.type !== 'info' && (
                    <View style={{ width: '100%', alignItems: 'flex-end' }}>
                      <Icon
                        rounded
                        source={images.cross}
                        size={30}
                        onPress={hideModal}
                        border={colors.white}
                      />
                    </View>
                  )}
                  {modalContent.type !== 'info' && modalType !== 'input' && (
                    <Image
                      source={
                        modalContent.type === 'success'
                          ? images.modal_check
                          : modalContent.type === 'warning'
                          ? images.warning
                          : images.modal_cross
                      }
                      style={{
                        height: heightPixel(78),
                        resizeMode: 'contain',
                        marginBottom: heightPixel(20),
                      }}
                    />
                  )}
                  <Text
                    style={[
                      styles.title,
                      modalContent.type == 'info' || modalType === 'input'
                        ? { width: '100%' }
                        : {},
                    ]}
                    color={colors.white}
                    position={modalType === 'input' ? 'left' : 'center'}
                    size={modalType === 'input' ? 16 : 23}
                    weight="bold"
                    line_height={modalType === 'input' ? 24 : 40}
                  >
                    {modalContent?.title}
                  </Text>
                  {modalContent?.message && (
                    <Text
                      style={[
                        styles.message,
                        modalContent.type == 'info' ? { width: '100%' } : {},
                      ]}
                      color={colors.white}
                      position="center"
                    >
                      {modalContent?.message}
                    </Text>
                  )}
                  {modalType === 'input' && (
                    <TextInput
                      style={styles.textInput}
                      placeholder={modalContent?.placeholder || 'Write here...'}
                      placeholderTextColor={colors.icon_gray}
                      value={inputValue}
                      onChangeText={setInputValue}
                      multiline
                      numberOfLines={4}
                    />
                  )}
                  {modalType === 'ok' ? (
                    <Button
                      text="OK"
                      onPress={() => {
                        setIsVisible(false);
                        setTimeout(() => {
                          modalContent.onConfirm();
                        }, 100);
                      }}
                    />
                  ) : modalType === 'info' ? null : modalType === 'input' ? (
                    <Button
                      text="Submit"
                      onPress={() => {
                        const value = inputValue;
                        setIsVisible(false);
                        setInputValue('');
                        setTimeout(() => {
                          modalContent.onConfirm(value);
                        }, 100);
                      }}
                    />
                  ) : (
                    <Row
                      justify="space-between"
                      align="center"
                      gap={10}
                      style={styles.buttonContainer}
                    >
                      <Button
                        text="Yes"
                        style={{ width: '50%', minWidth: 'auto' }}
                        onPress={() => {
                          setIsVisible(false);
                          setTimeout(() => {
                            modalContent.onConfirm();
                          }, 100);
                        }}
                      />
                      <Button
                        text="No"
                        type="outlined"
                        style={{ width: '50%', minWidth: 'auto' }}
                        onPress={() => {
                          if (modalContent?.onCancel) {
                            modalContent.onCancel();
                          }
                          hideModal();
                        }}
                      />
                    </Row>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </ModalContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '75%',
    padding: 20,
    // paddingBottom: heightPixel(40),
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(10),
    alignItems: 'center',
    borderWidth: font(2),
    borderColor: colors.gray,
  },
  title: {
    width: '80%',
    marginBottom: heightPixel(10),
  },
  message: {
    marginBottom: heightPixel(30),
    width: '80%',
  },
  buttonContainer: {
    width: '90%',
  },
  textInput: {
    width: '100%',
    minHeight: heightPixel(100),
    backgroundColor: colors.gray,
    borderRadius: heightPixel(8),
    padding: heightPixel(12),
    color: colors.white,
    marginBottom: heightPixel(20),
    textAlignVertical: 'top',
  },
});
