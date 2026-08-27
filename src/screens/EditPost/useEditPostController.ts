import { useState, useCallback, useEffect } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { goBack } from '../../utils/navigation';
import { useModal } from '../../contexts/ModalContext';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { useUpdateFeedMutation } from '../../redux/Apis/User';
import {
  filterValidFeedMediaAssets,
  validateFeedMediaItemsForUpload,
} from '../../utils/feedMediaValidation';

type PollOptionInput = {
  id?: number;
  poll_option_id?: number;
  text?: string;
  option_text?: string;
  label?: string;
  option?: string;
};

export const getPollOptionText = (option?: PollOptionInput | null): string =>
  (option?.text ?? option?.option_text ?? option?.label ?? option?.option ?? '').trim();

export const normalizePollOptionsForEdit = (options?: PollOptionInput[]) => {
  if (!options?.length) {
    return [
      { id: 1, text: '' },
      { id: 2, text: '' },
    ];
  }

  return options.map((option, index) => ({
    id: option?.id ?? option?.poll_option_id ?? index + 1,
    text: getPollOptionText(option),
  }));
};

const useEditPostController = (postData: any) => {
  const navigation = useNavigation();
  const { showOkModal } = useModal();
  const [updateFeed, { isLoading }] = useUpdateFeedMutation();

  const user = useAppSelector(selectUser);

  const [content, setContent] = useState(
    postData?.title || postData?.content || '',
  );
  const [media, setMedia] = useState<any[]>([]);
  const [existingMedia, setExistingMedia] = useState<any[]>(
    postData?.post_media || [],
  );
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
  const [pollOptions, setPollOptions] = useState(
    normalizePollOptionsForEdit(postData?.poll_options),
  );
  const [activeTab, setActiveTab] = useState<
    'text' | 'photo' | 'video' | 'poll'
  >(
    postData?.is_poll
      ? 'poll'
      : postData?.post_media && postData.post_media.length > 0
      ? 'photo'
      : 'text',
  );

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

  const removeExistingMedia = useCallback((mediaId: number) => {
    setExistingMedia(prev => prev.filter(item => item.id !== mediaId));
    setDeletedMediaIds(prev => [...prev, mediaId]);
  }, []);

  const addPollOption = useCallback(() => {
    const newId = Math.max(...pollOptions.map((opt: any) => opt.id || 0)) + 1;
    setPollOptions(prev => [...prev, { id: newId, text: '' }]);
  }, [pollOptions]);

  const removePollOption = useCallback((id: number) => {
    setPollOptions(prev => prev.filter(opt => opt.id !== id));
  }, []);

  const updatePollOption = useCallback((id: number, text: string) => {
    setPollOptions(prev =>
      prev.map(opt => (opt.id === id ? { ...opt, text } : opt)),
    );
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      // Validation
      if (activeTab === 'poll') {
        if (!content.trim()) {
          showOkModal({
            type: 'error',
            title: 'Error',
            message: 'Please enter a poll question',
          });
          return;
        }
        const validOptions = pollOptions.filter(opt => getPollOptionText(opt));
        if (validOptions.length < 2) {
          showOkModal({
            type: 'error',
            title: 'Error',
            message: 'Please provide at least 2 poll options',
          });
          return;
        }
      } else if (
        !content.trim() &&
        media.length === 0 &&
        existingMedia.length === 0
      ) {
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

      // Create FormData
      const formData = new FormData();

      const trimmedTitle = content.trim();
      if (trimmedTitle) {
        formData.append('title', trimmedTitle);
      }

      // Add poll options if this is a poll
      if (activeTab === 'poll') {
        pollOptions.forEach((option: any, index: number) => {
          const optionText = getPollOptionText(option);
          if (optionText) {
            formData.append(`poll[${index}]`, optionText);
          }
        });
      }

      // Add new media files
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

      // Add deleted media IDs
      if (deletedMediaIds.length > 0) {
        deletedMediaIds.forEach((id, index) => {
          formData.append(`deleted_files_ids[${index}]`, id.toString());
        });
      }

      // Call API
      const response = await updateFeed({
        id: postData.id,
        body: formData,
      }).unwrap();

      // Show success message
      showOkModal(
        {
          type: 'success',
          title: 'Successfully',
          message: 'Post Has Been Updated Successfully',
        },
        () => {
          goBack();
        },
      );
    } catch (error: any) {
      console.error('Update post error:', error);
      showOkModal({
        type: 'error',
        title: 'Error',
        message:
          error?.data?.message || 'Failed to update post. Please try again.',
      });
    }
  }, [
    content,
    media,
    existingMedia,
    deletedMediaIds,
    pollOptions,
    activeTab,
    updateFeed,
    showOkModal,
    postData.id,
  ]);

  return {
    values: {
      user,
      user_image: user?.photo,
      content,
      media,
      existingMedia,
      pollOptions,
      activeTab,
      isLoading,
    },
    functions: {
      setContent,
      setActiveTab,
      handlePickMedia,
      removeMedia,
      removeExistingMedia,
      addPollOption,
      removePollOption,
      updatePollOption,
      handleUpdate,
      goBack,
    },
  };
};

export default useEditPostController;
