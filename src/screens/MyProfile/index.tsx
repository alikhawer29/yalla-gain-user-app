
import { View } from 'react-native';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import colors from '../../utils/colors';
import { capitalizeFirst } from '../../utils/data';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import styles from './styles';

const MyProfile = () => {
  const user = useAppSelector(selectUser);

  return (
    <Wrapper bottom_bar floating scrollable>
      <View style={styles.icon_container}>
        <Icon
          source={{ uri: user?.photo }}
          size={100}
          rounded
          no_padding
          resize="cover"
        />
      </View>
      <Row style={styles.item_container}>
        <View style={[styles.item, styles.item_width]}>
          <Text color={colors.icon_gray}>User's Unique Id</Text>
          <Text weight="bold">{user?.id}</Text>
        </View>
        <View style={[styles.item, styles.item_width]}>
          <Text color={colors.icon_gray}>First Name</Text>
          <Text weight="bold">{user?.first_name}</Text>
        </View>
        <View style={[styles.item, styles.item_width]}>
          <Text color={colors.icon_gray}>Last Name</Text>
          <Text weight="bold">{user?.last_name}</Text>
        </View>
        <View style={[styles.item, styles.item_width]}>
          <Text color={colors.icon_gray}>Phone Number</Text>
          <Text weight="bold">
            ({user?.dialing_code}) {user?.phone}
          </Text>
        </View>
        {user?.gender ? (
          <View style={[styles.item, styles.item_width]}>
            <Text color={colors.icon_gray}>Gender</Text>
            <Text weight="bold" capitalize>
              {capitalizeFirst(user.gender)}
            </Text>
          </View>
        ) : null}
        <View style={[styles.item, styles.item_width]}>
          <Text color={colors.icon_gray}>Language</Text>
          <Text weight="bold" capitalize>
            {user?.language}
          </Text>
        </View>
        <View style={[styles.item, styles.item_last]}>
          <Text color={colors.icon_gray} lines={1}>
            Email Address
          </Text>
          <Text weight="bold">{user?.email}</Text>
        </View>

      </Row>

      <Button
        text="Edit Profile"
        style={styles.item}
        onPress={() => navigate(ROUTES.EDIT_PROFILE)}
      />
      <Button
        text="Change Password"
        type="outlined"
        style={styles.item}
        onPress={() => navigate(ROUTES.CHANGE_PASSWORD)}
      />
    </Wrapper>
  );
};

export default MyProfile;
