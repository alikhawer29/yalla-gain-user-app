import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export const openImageGallery = async (onSelect: (data: any) => void) => {
  launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
  })
    .then(async photo => {
      let image = photo?.assets?.[0];
      let data = null;

      if (image) {
        data = {
          ...image,
          name: image?.fileName,
          type: image?.type,
          uri: image?.uri,
          previewUri: image?.uri
            ? `${image.uri}${
                image.uri.includes('?') ? '&' : '?'
              }t=${Date.now()}`
            : image?.uri,
        };
      }

      onSelect(data);
    })
    .catch(err => {
      console.log(err);
    });
};

export const openImageCamera = (onSelect: (data: any) => void) => {
  launchCamera({
    mediaType: 'photo',
  })
    .then(photo => {
      let image = photo?.assets?.[0];
      let data = null;

      if (image) {
        data = {
          ...image,
          name: image?.fileName,
          type: image?.type,
          uri: image?.uri,
          previewUri: image?.uri
            ? `${image.uri}${
                image.uri.includes('?') ? '&' : '?'
              }t=${Date.now()}`
            : image?.uri,
        };
      }

      onSelect(data);
    })
    .catch(err => {
      console.log(err);
    });
};
