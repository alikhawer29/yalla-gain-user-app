import { ImageSourcePropType } from 'react-native';
import images from '../assets/images';

export type PrescriptionFileCategory = 'image' | 'pdf' | 'xlsx' | 'docs';

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'heic',
]);

const PDF_EXTENSIONS = new Set(['pdf']);

const XLSX_EXTENSIONS = new Set(['xlsx', 'xls']);

const DOCS_EXTENSIONS = new Set(['doc', 'docx', 'txt', 'rtf', 'odt']);

const getExtension = (value?: string | null): string => {
  if (!value) return '';
  const clean = value.split('?')[0].toLowerCase();
  const parts = clean.split('.');
  if (parts.length < 2) return '';
  return parts.pop() || '';
};

/** Resolve category from API `prescription_file_type` or file extension. */
export const resolvePrescriptionFileCategory = (
  fileType?: string | null,
  fileName?: string | null,
  fileUrl?: string | null,
): PrescriptionFileCategory => {
  const normalized = fileType?.toLowerCase().trim();
  if (
    normalized === 'image' ||
    normalized === 'pdf' ||
    normalized === 'xlsx' ||
    normalized === 'docs'
  ) {
    return normalized;
  }

  const ext = getExtension(fileName) || getExtension(fileUrl);
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (PDF_EXTENSIONS.has(ext)) return 'pdf';
  if (XLSX_EXTENSIONS.has(ext)) return 'xlsx';
  if (DOCS_EXTENSIONS.has(ext)) return 'docs';
  return 'pdf';
};

export const getPrescriptionFileIcon = (
  category: PrescriptionFileCategory,
): ImageSourcePropType => {
  switch (category) {
    case 'image':
      return images.gallery;
    case 'pdf':
      return images.helpdesk.pdf;
    case 'xlsx':
      return images.helpdesk.xlsx;
    case 'docs':
      return images.helpdesk.docs;
    default:
      return images.helpdesk.pdf;
  }
};

export const isPrescriptionImageCategory = (
  category: PrescriptionFileCategory,
): boolean => category === 'image';
