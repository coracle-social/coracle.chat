import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

//!! backedn upload for imaage

export interface ImageUploadResult {
  uri: string;
  width: number;
  height: number;
  type: string;
  size?: number;
}

/**
 * Requests permission to access the device's photo library
 * @returns Promise that resolves to true if permission is granted
 */
export const requestImagePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need explicit permission
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Sorry, we need camera roll permissions to upload images.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

/**
 * Requests permission to access the device's camera
 * @returns Promise that resolves to true if permission is granted
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need explicit permission
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Sorry, we need camera permissions to take photos.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

/**
 * Opens the image picker to select an image from the photo library
 * @returns Promise that resolves to the selected image or null if cancelled
 */
export const pickImageFromLibrary = async (): Promise<ImageUploadResult | null> => {
  const hasPermission = await requestImagePermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking image from library:', error);
    Alert.alert('Error', 'Failed to pick image from library.');
    return null;
  }
};

/**
 * Opens the camera to take a new photo
 * @returns Promise that resolves to the captured image or null if cancelled
 */
export const takePhotoWithCamera = async (): Promise<ImageUploadResult | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize,
      };
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo.');
    return null;
  }
};

/**
 * Converts a local image URI to a data URL for web storage
 * @param uri - The local image URI
 * @returns Promise that resolves to the data URL
 */
export const convertImageToDataUrl = async (uri: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = uri;
  });
};

/**
 * Shows an action sheet to choose between camera and photo library
 * @returns Promise that resolves to the selected image or null if cancelled
 */
export const showImagePickerOptions = async (): Promise<ImageUploadResult | null> => {
  if (Platform.OS === 'web') {
    // On web, just open the file picker directly
    return pickImageFromLibrary();
  }

  // On mobile, show action sheet
  return new Promise((resolve) => {
    Alert.alert(
      'Choose Image',
      'Select an image source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await takePhotoWithCamera();
            resolve(result);
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const result = await pickImageFromLibrary();
            resolve(result);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ]
    );
  });
};

/**
 * Processes an image for Nostr profile upload
 * On web: converts to data URL for Nostr storage
 * On mobile: uses local URI for Nostr storage
 * @param imageResult - The image result from picker
 * @returns Promise that resolves to the image URL for Nostr profile
 */
export const uploadImageToStorage = async (imageResult: ImageUploadResult): Promise<string> => {
  if (Platform.OS === 'web') {
    // On web, convert to data URL for Nostr storage
    return convertImageToDataUrl(imageResult.uri);
  } else {
    // On mobile, use the local URI for Nostr storage
    return imageResult.uri;
  }
};