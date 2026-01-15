import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { RootStackParamList } from '../../interfaces';
import { ROUTES } from '../../utils/routes';
import images from '../../assets/images';

type ScreenRouteProp = RouteProp<
  RootStackParamList,
  typeof ROUTES.AVATAR_VISUALIZATION
>;

const useAvatarVisualizationController = () => {
  const navigation = useNavigation();
  const route = useRoute<ScreenRouteProp>();
  const { type } = route.params || { type: 'initial' }; // Default to initial

  const [avatarImage, setAvatarImage] = useState(images.avatar.fat);
  const [title, setTitle] = useState('Avatar Details');

  useEffect(() => {
    if (type === 'initial') {
      setAvatarImage(images.avatar.detailed_avatar);
      setTitle('Avatar Details');
      // Set title via route params so Options component can read it
      (navigation as any).setParams({ title: 'Avatar Details' });
    } else {
      setAvatarImage(images.avatar.detailed_avatar); // Or detailed_avatar if preferred
      setTitle('Progress Tracking');
      // Set title via route params so Options component can read it
      (navigation as any).setParams({ title: 'Progress Tracking' });
    }
  }, [type, navigation]);

  const handleShare = () => {
    // Implement share logic
    console.log('Share Avatar');
  };

  const handleEdit = () => {
    // Implement edit logic
    console.log('Edit Avatar');
  };

  const handleAddProgress = () => {
    // Implement add progress logic
    console.log('Add Progress');
  };

  return {
    values: {
      type,
      avatarImage,
      title,
    },
    functions: {
      handleShare,
      handleEdit,
      handleAddProgress,
    },
  };
};

export default useAvatarVisualizationController;
