import React, { FC, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import Button from '../Button';
import Icon from '../Icon';
import Row from '../Row';
import Seperator from '../Seperator';
import Text from '../Text';

export type MuscleOption = { id: number; name: string };

export interface IWorkoutFilterModal {
  visible: boolean;
  onClose: () => void;
  /** `null` = all muscles (no `muscle_id` param). */
  onApply: (muscleId: number | null) => void;
  initialMuscleId: number | null;
  muscles: MuscleOption[];
  musclesLoading?: boolean;
}

const LIST_MAX_HEIGHT = heightPixel(320);

const WorkoutFilterModal: FC<IWorkoutFilterModal> = ({
  visible,
  onClose,
  onApply,
  initialMuscleId,
  muscles,
  musclesLoading = false,
}) => {
  const [selected, setSelected] = useState<number | null>(initialMuscleId);

  useEffect(() => {
    if (visible) {
      setSelected(initialMuscleId);
    }
  }, [visible, initialMuscleId]);

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  const handleClear = () => {
    setSelected(null);
    onApply(null);
    onClose();
  };

  const options: { key: string; label: string; muscleId: number | null }[] = [
    { key: 'all', label: 'All', muscleId: null },
    ...muscles.map(m => ({
      key: String(m.id),
      label: m.name,
      muscleId: m.id,
    })),
  ];

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
                Muscle
              </Text>
              <Seperator size={12} />

              {musclesLoading ? (
                <View style={[styles.optionsScroll, styles.loadingBox]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <ScrollView
                  style={styles.optionsScroll}
                  contentContainerStyle={styles.optionsScrollContent}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  keyboardShouldPersistTaps="handled"
                >
                  {options.map(opt => {
                    const isSelected =
                      selected === opt.muscleId ||
                      (opt.muscleId === null && selected === null);
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                        onPress={() => setSelected(opt.muscleId)}
                        activeOpacity={0.7}
                      >
                        <Text
                          size={14}
                          weight={isSelected ? 'semibold' : 'regular'}
                          color={isSelected ? colors.primary : colors.white}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

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
  loadingBox: {
    minHeight: heightPixel(120),
    justifyContent: 'center',
    alignItems: 'center',
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

export default WorkoutFilterModal;
