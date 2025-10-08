import { launchCamera, launchImageLibrary } from "react-native-image-picker"

export const openImageGallery = async (onSelect) => {

  launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1
  })
    .then(async (photo) => {

      let image = photo?.assets?.[0]
      let data = null

      if (image) {
        data = {
          ...image,
          name: image?.fileName,
          type: image?.type,
          uri: image?.uri
        }
      }

      onSelect(data)

    })
    .catch((err) => {
      console.log(err)
    })
}

export const openImageCamera = (onSelect) => {
  launchCamera({
    mediaType: 'photo',
  })
    .then((photo) => {

      let image = photo?.assets?.[0]
      let data = null

      if (image) {
        data = {
          ...image,
          name: image?.fileName,
          type: image?.type,
          uri: image?.uri
        }
      }

      onSelect(data)

    })
    .catch((err) => {
      console.log(err)
    })
}