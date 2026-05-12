import { FC, memo, useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import images from '../../../assets/images';
import { IChatMessage } from '../../../interfaces';
import colors from '../../../utils/colors';
import Icon from '../../Icon';
import Row from '../../Row';
import Text from '../../Text';
import styles from './styles';
import { formatChatTime12h } from '../../../utils/chatDateTime';

interface IChatMessageCardProps {
  message: IChatMessage;
  isMine: boolean;
  currentUserId?: number;
}

const ChatMessageCard: FC<IChatMessageCardProps> = ({ message, isMine }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const Tail = ({ right = true, fill = colors.blackish_gray }) => {
    const dLeft = 'M0 0 L0 18 L18 18 Z';
    const dRight = 'M14 0 L18 18 L0 18 Z';

    return (
      <Svg
        width={18}
        height={18}
        viewBox="0 0 18 18"
        style={right ? styles.tailRight : styles.tailLeft}
      >
        <Path d={right ? dRight : dLeft} fill={fill} />
      </Svg>
    );
  };

  const renderFiles = () => {
    if (!message.file || message.file.length === 0) return null;

    return (
      <View style={styles.files_container}>
        {message.file.map((file: any, index: number) => {
          const uri =
            typeof file === 'string'
              ? file
              : file.url || file.path || file.uri || file.media_url;
          if (!uri || typeof uri !== 'string') return null;

          return (
            <Image
              key={index}
              source={{ uri }}
              style={styles.file_image}
              resizeMode="cover"
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isMine ? styles.sender_container : styles.receiver_container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      {!isMine && (
        <View style={styles.avatar_container}>
          <Icon
            source={
              message.image && message.image.trim() !== ''
                ? { uri: message.image }
                : images.dummy
            }
            rounded
            no_padding
            size={39}
          />
        </View>
      )}
      <View
        style={[
          styles.message_bubble,
          isMine ? styles.sender_bubble : styles.receiver_bubble,
        ]}
      >
        <Tail right={isMine} />
        {renderFiles()}
        {message.message && <Text size={12}>{message.message}</Text>}
        <Row align="center" justify="flex-end" gap={5}>
          <Icon source={images.clock} tint_color={colors.icon_gray} size={10} />
          <Text size={10} color={colors.icon_gray}>
            {formatChatTime12h(message.date, message.time)}
          </Text>
        </Row>
      </View>
      {isMine && (
        <View style={styles.avatar_container}>
          <Icon
            source={
              message.image && message.image.trim() !== ''
                ? { uri: message.image }
                : images.dummy
            }
            rounded
            no_padding
            size={39}
          />
        </View>
      )}
    </Animated.View>
  );
};

export default memo(ChatMessageCard);
