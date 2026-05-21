import RNFS from 'react-native-fs';

/** Backend rule: each upload field max 51200 kilobytes (≈ 50 MB). */
export const MAX_FEED_MEDIA_SIZE_KB = 51200;
export const MAX_FEED_MEDIA_SIZE_BYTES = MAX_FEED_MEDIA_SIZE_KB * 1024;

type PickerAssetLike = {
  uri?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};

export const formatFeedMediaLimit = (): string => {
  const mb = MAX_FEED_MEDIA_SIZE_KB / 1024;
  return `${mb} MB`;
};

export const formatBytesForUser = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024).toLocaleString()} KB`;
};

export const getPickerAssetSizeBytes = async (
  asset: PickerAssetLike,
): Promise<number | null> => {
  if (asset.fileSize != null && asset.fileSize > 0) {
    return asset.fileSize;
  }
  if (!asset.uri) return null;

  try {
    const path = asset.uri.startsWith('file://')
      ? asset.uri.replace('file://', '')
      : asset.uri;
    const stat = await RNFS.stat(path);
    return stat.size ?? null;
  } catch {
    return null;
  }
};

export const isFeedMediaWithinSizeLimit = (sizeBytes: number): boolean =>
  sizeBytes <= MAX_FEED_MEDIA_SIZE_BYTES;

export type FeedMediaAssetFilterResult<T extends PickerAssetLike> = {
  accepted: T[];
  rejectedMessages: string[];
};

/** Run when user picks files — reject oversize before adding to state. */
export const filterValidFeedMediaAssets = async <T extends PickerAssetLike>(
  assets: T[],
): Promise<FeedMediaAssetFilterResult<T>> => {
  const accepted: T[] = [];
  const rejectedMessages: string[] = [];

  for (const asset of assets) {
    const sizeBytes = await getPickerAssetSizeBytes(asset);
    const label = asset.fileName || 'Selected file';

    if (sizeBytes == null) {
      rejectedMessages.push(
        `${label}: could not read file size. Please try another file.`,
      );
      continue;
    }

    if (!isFeedMediaWithinSizeLimit(sizeBytes)) {
      rejectedMessages.push(
        `${label} (${formatBytesForUser(
          sizeBytes,
        )}) exceeds the maximum of ${formatFeedMediaLimit()} per file.`,
      );
      continue;
    }

    accepted.push(asset);
  }

  return { accepted, rejectedMessages };
};

/** Run before API upload — safety check on items already in state. */
export const validateFeedMediaItemsForUpload = async (
  mediaItems: { original?: PickerAssetLike; type?: string }[],
): Promise<{ isValid: boolean; message: string }> => {
  if (!mediaItems.length) {
    return { isValid: true, message: '' };
  }

  const assets = mediaItems
    .map(item => item.original)
    .filter((asset): asset is PickerAssetLike => !!asset);

  const { rejectedMessages } = await filterValidFeedMediaAssets(assets);

  if (rejectedMessages.length === 0) {
    return { isValid: true, message: '' };
  }

  return {
    isValid: false,
    message: rejectedMessages.join('\n'),
  };
};
