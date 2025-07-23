import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

export interface ImageUploadResult {
  uri: string;
  width: number;
  height: number;
  type: string;
  size?: number;
}

export const requestImagePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
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

export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
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

export const pickImageFromLibrary = async (): Promise<any> => {
  const hasPermission = await requestImagePermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Error picking image from library:', error);
    Alert.alert('Error', 'Failed to pick image from library.');
    return null;
  }
};

export const takePhotoWithCamera = async (): Promise<any> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo.');
    return null;
  }
};

export const showImagePickerOptions = async (): Promise<ImageUploadResult | null> => {
  if (Platform.OS === 'web') {
    const asset = await pickImageFromLibrary();
    if (!asset) return null;

    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: asset.type || 'image/jpeg',
      size: asset.fileSize,
    };
  }

  return new Promise((resolve) => {
    Alert.alert(
      'Choose Image',
      'Select an image source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const asset = await takePhotoWithCamera();
            if (!asset) {
              resolve(null);
              return;
            }
            resolve({
              uri: asset.uri,
              width: asset.width,
              height: asset.height,
              type: asset.type || 'image/jpeg',
              size: asset.fileSize,
            });
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const asset = await pickImageFromLibrary();
            if (!asset) {
              resolve(null);
              return;
            }
            resolve({
              uri: asset.uri,
              width: asset.width,
              height: asset.height,
              type: asset.type || 'image/jpeg',
              size: asset.fileSize,
            });
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