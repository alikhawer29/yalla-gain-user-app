import { useState, useCallback, useMemo } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { goBack } from '../../utils/navigation';
import { useModal } from '../../contexts/ModalContext';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { useCreateFeedMutation } from '../../redux/Apis/User';
import {
  filterValidFeedMediaAssets,
  validateFeedMediaItemsForUpload,
} from '../../utils/feedMediaValidation';

const useCreatePostController = (initialTab?: 'photo' | 'video' | 'poll') => {
  const navigation = useNavigation();
  const { showOkModal } = useModal();
  const [createFeed, { isLoading }] = useCreateFeedMutation();

  const user = useAppSelector(selectUser);

  const [content, setContent] = useState('');
  const [media, setMedia] = useState<any[]>([]);
  const [pollOptions, setPollOptions] = useState([
    { id: 1, text: '' },
    { id: 2, text: '' },
  ]);
  const [activeTab, setActiveTab] = useState<
    'text' | 'photo' | 'video' | 'poll'
  >(initialTab || 'text');
  const [postingPhase, setPostingPhase] = useState<
    'uploading' | 'finishing' | null
  >(null);
  const [postProgress, setPostProgress] = useState(0);

  const canPost = useMemo(() => {
    const hasTitle = !!content.trim();
    const hasMedia = media.length > 0;
    const pollAnswers = pollOptions.filter(opt => opt.text.trim()).length;
    const hasPoll =
      activeTab === 'poll' && !!content.trim() && pollAnswers >= 2;
    return hasTitle || hasMedia || hasPoll;
  }, [content, media, pollOptions, activeTab]);

  const handlePickMedia = useCallback(async (type: 'photo' | 'video') => {
    const options: any = {
      mediaType: type,
      selectionLimit: 0, // 0 means unlimited
    };

    const result = await launchImageLibrary(options);

    if (result.assets) {
      const { accepted, rejectedMessages } = await filterValidFeedMediaAssets(
        result.assets,
      );

      if (rejectedMessages.length > 0) {
        showOkModal({
          type: 'error',
          title: 'File too large',
          message: rejectedMessages.join('\n'),
        });
      }

      if (accepted.length > 0) {
        const newMedia = accepted.map(asset => ({
          type: type,
          source: { uri: asset.uri },
          original: asset,
        }));
        setMedia(prev => [...prev, ...newMedia]);
      }
    }
  }, [showOkModal]);

  const removeMedia = useCallback((index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addPollOption = useCallback(() => {
    setPollOptions(prev => [...prev, { id: prev.length + 1, text: '' }]);
  }, []);

  const removePollOption = useCallback(
    (id: number) => {
      if (pollOptions.length > 2) {
        setPollOptions(prev => prev.filter(opt => opt.id !== id));
      }
    },
    [pollOptions.length],
  );

  const updatePollOption = useCallback((id: number, text: string) => {
    setPollOptions(prev =>
      prev.map(opt => (opt.id === id ? { ...opt, text } : opt)),
    );
  }, []);

  const handlePost = useCallback(async () => {
    if (!canPost || postingPhase) return;

    // Validate input before upload UI / API
    if (activeTab === 'poll') {
      if (!content.trim()) {
        showOkModal({
          type: 'error',
          title: 'Error',
          message: 'Please enter a poll question',
        });
        return;
      }
      const validOptions = pollOptions.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        showOkModal({
          type: 'error',
          title: 'Error',
          message: 'Please provide at least 2 poll options',
        });
        return;
      }
    } else if (!content.trim() && media.length === 0) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please add some content or media',
      });
      return;
    }

    if (media.length > 0) {
      const sizeCheck = await validateFeedMediaItemsForUpload(media);
      if (!sizeCheck.isValid) {
        showOkModal({
          type: 'error',
          title: 'File too large',
          message: sizeCheck.message,
        });
        return;
      }
    }

    let progressTimer: ReturnType<typeof setInterval> | null = null;

    try {
      setPostingPhase('uploading');
      setPostProgress(8);

      progressTimer = setInterval(() => {
        setPostProgress(prev => {
          if (prev >= 88) return prev;
          return prev + (prev < 50 ? 4 : 2);
        });
      }, 280);

      // Create FormData
      const formData = new FormData();

      const trimmedTitle = content.trim();
      if (trimmedTitle) {
        formData.append('title', trimmedTitle);
      }

      // Add poll options if this is a poll
      if (activeTab === 'poll') {
        pollOptions.forEach((option, index) => {
          if (option.text.trim()) {
            formData.append(`poll[${index}]`, option.text);
          }
        });
      }

      // Add media files
      if (media.length > 0) {
        media.forEach((item, index) => {
          const file = {
            uri: item.original.uri,
            type:
              item.original.type ||
              (item.type === 'video' ? 'video/mp4' : 'image/jpeg'),
            name:
              item.original.fileName ||
              `media_${index}.${item.type === 'video' ? 'mp4' : 'jpg'}`,
          };
          formData.append(`files[${index}]`, file as any);
        });
      }

      await createFeed(formData).unwrap();

      if (progressTimer) clearInterval(progressTimer);
      progressTimer = null;

      setPostingPhase('finishing');
      setPostProgress(92);
      await new Promise<void>(resolve => setTimeout(resolve, 450));
      setPostProgress(100);
      await new Promise<void>(resolve => setTimeout(resolve, 300));

      // Show success message
      showOkModal(
        {
          type: 'success',
          title: 'Successfully',
          message: 'Post Has Been Created Successfully',
        },
        () => {
          goBack();
        },
      );
    } catch (error: any) {
      console.error('Create post error:', error);
      showOkModal({
        type: 'error',
        title: 'Error',
        message:
          error?.data?.message || 'Failed to create post. Please try again.',
      });
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      setPostingPhase(null);
      setPostProgress(0);
    }
  }, [
    canPost,
    content,
    media,
    pollOptions,
    activeTab,
    createFeed,
    showOkModal,
    postingPhase,
  ]);

  // Auto trigger picker if initialTab is photo or video (Optional, but user might expect UI to open)
  // For now we just set the tab.

  return {
    values: {
      user,
      user_image: user?.photo,
      content,
      media,
      pollOptions,
      activeTab,
      isLoading,
      canPost,
      postingPhase,
      postProgress,
    },
    functions: {
      setContent,
      setActiveTab,
      handlePickMedia,
      removeMedia,
      addPollOption,
      removePollOption,
      updatePollOption,
      handlePost,
      goBack,
    },
  };
};

export default useCreatePostController;
