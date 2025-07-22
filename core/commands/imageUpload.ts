import { Platform } from 'react-native';
import { convertImageToDataUrl } from '@/lib/utils/imageHandling';
import { showImagePickerOptions, ImageUploadResult } from './imagePicker';

export { showImagePickerOptions } from './imagePicker';
export type { ImageUploadResult } from './imagePicker';

export const uploadImageToStorage = async (imageResult: ImageUploadResult): Promise<string> => {
  if (Platform.OS === 'web') {
    return convertImageToDataUrl(imageResult.uri);
  } else {
    return imageResult.uri;
  }
};