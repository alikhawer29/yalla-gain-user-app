import React from 'react';
import { Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import images from '../../assets/images';

type Props = {
  visible: boolean;
  dayNumber: number;
  onClose: () => void;
  /** Close + refetch (stay on current screen). */
  onBackToChallenges: () => void | Promise<void>;
};

const ChallengeDayCompleteModal: React.FC<Props> = ({
  visible,
  dayNumber,
  onClose,
  onBackToChallenges,
}) => {
  const handlePrimary = async () => {
    await onBackToChallenges();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon source={images.cross} size={10} tint_color={colors.white} />
          </TouchableOpacity>

          <Text style={styles.celebrationEmoji} accessibilityLabel="Celebration">
            🎉
          </Text>

          <Text style={styles.title}>Congratulations</Text>
          <Text style={styles.message}>
            {`Congratulations You Have Completed The 'Challenge Day ${dayNumber}' Successfully`}
          </Text>

          <Button
            text="Back To Challenges"
            type="primary"
            onPress={handlePrimary}
            style={styles.primaryButton}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: heightPixel(20),
    paddingHorizontal: widthPixel(24),
    paddingTop: heightPixel(40),
    paddingBottom: heightPixel(28),
    width: widthPixel(320),
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: heightPixel(16),
    right: widthPixel(16),
    width: heightPixel(32),
    height: heightPixel(32),
    borderRadius: heightPixel(16),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: heightPixel(56),
    marginBottom: heightPixel(16),
    textAlign: 'center',
  },
  title: {
    fontSize: heightPixel(22),
    fontWeight: '700',
    color: colors.white,
    marginBottom: heightPixel(12),
    textAlign: 'center',
  },
  message: {
    fontSize: heightPixel(15),
    color: colors.white,
    textAlign: 'center',
    lineHeight: heightPixel(22),
    marginBottom: heightPixel(28),
    fontWeight: '400',
  },
  primaryButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
});

export default ChallengeDayCompleteModal;
