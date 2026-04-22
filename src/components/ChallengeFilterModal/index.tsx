import React, { FC, useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { challengeBodyPartOptions } from '../../utils/data';
import { heightPixel, widthPixel } from '../../utils/helper';
import Button from '../Button';
import Icon from '../Icon';
import Row from '../Row';
import Seperator from '../Seperator';
import Text from '../Text';

export interface IChallengeFilterModal {
  visible: boolean;
  onClose: () => void;
  /** Committed body-part `type` query value (`''` = all). */
  onApply: (type: string) => void;
  initialType?: string;
}

const LIST_MAX_HEIGHT = heightPixel(320);

const ChallengeFilterModal: FC<IChallengeFilterModal> = ({
  visible,
  onClose,
  onApply,
  initialType = '',
}) => {
  const [selected, setSelected] = useState(initialType);

  useEffect(() => {
    if (visible) {
      setSelected(initialType);
    }
  }, [visible, initialType]);

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  const handleClear = () => {
    setSelected('');
    onApply('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <Row align="center" gap={15}>
                <TouchableOpacity onPress={onClose}>
                  <Icon source={images.back} size={18} tint_color={colors.white} />
                </TouchableOpacity>
                <Text size={18} weight="semibold">
                  Filter By
                </Text>
              </Row>

              <Seperator size={25} />

              <Text size={14} weight="semibold">
                Body part
              </Text>
              <Seperator size={12} />

              <ScrollView
                style={styles.optionsScroll}
                contentContainerStyle={styles.optionsScrollContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                {challengeBodyPartOptions.map(item => {
                  const isSelected = selected === item.value;
                  return (
                    <TouchableOpacity
                      key={String(item.value)}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                      onPress={() => setSelected(item.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        size={14}
                        weight={isSelected ? 'semibold' : 'regular'}
                        color={isSelected ? colors.primary : colors.white}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Seperator size={28} />

              <Row gap={15}>
                <Button text="APPLY" onPress={handleApply} style={styles.apply_btn} />
                <Button
                  text="CLEAR"
                  onPress={handleClear}
                  style={styles.clear_btn}
                  type="outlined"
                />
              </Row>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.grayish_black,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: widthPixel(20),
    paddingBottom: heightPixel(40),
    maxHeight: '92%',
  },
  optionsScroll: {
    maxHeight: LIST_MAX_HEIGHT,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: heightPixel(10),
    backgroundColor: colors.light_primary,
  },
  optionsScrollContent: {
    paddingVertical: heightPixel(4),
  },
  optionRow: {
    paddingVertical: heightPixel(14),
    paddingHorizontal: widthPixel(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionRowSelected: {
    backgroundColor: colors.light_transparent_primary,
  },
  apply_btn: {
    flex: 1,
  },
  clear_btn: {
    flex: 1,
  },
});

export default ChallengeFilterModal;
