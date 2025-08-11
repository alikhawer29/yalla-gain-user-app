import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { IEmpty } from '../../interfaces';
import colors from '../../utils/colors';
import Icon from '../Icon';
import Text from '../Text';
import styles from './styles';

const Empty: FC<IEmpty> = ({ message = "No Data Found", image }) => {
    return (
        <View style={styles.container}>
            {
                image &&
                <View style={styles.icon}>
                    <Icon source={image} tint_color={colors.gray} size={80} />
                </View>
            }
            <Text weight='semibold' size={16} color={colors.gray}>{message}</Text>
        </View>
    );
}

export default memo(Empty)