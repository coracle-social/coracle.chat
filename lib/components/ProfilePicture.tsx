import { ImageUploadResult, showImagePickerOptions, uploadImageToStorage } from '@/core/commands/imageUpload';
import { BorderRadius } from '@/core/env/BorderRadius';
import { Shadows } from '@/core/env/Shadows';
import { spacing } from '@/core/env/Spacing';
import { Typography } from '@/core/env/Typography';
import { CloseButton } from '@/lib/components/CloseButton';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import { Avatar, Button } from '@rneui/themed';
import { useState } from 'react';
import { Alert, Dimensions, Modal, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ProfilePictureProps {
  avatarUrl: string;
  size?: number;
  onImageChange?: (newImageUrl: string) => void;
  onImageSave?: (newImageUrl: string) => Promise<void>;
}

export default function ProfilePicture({
  avatarUrl,
  size = 90,
  onImageChange,
  onImageSave
}: ProfilePictureProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageUploadResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const colors = useThemeColors();

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768;
  const isWeb = Platform.OS === 'web';

  const avatarSize = isMobile ? 120 : size;

  const handleExpandPress = () => {
    setIsModalVisible(true);
  };

  const handleModalDismiss = () => {
    setIsModalVisible(false);

    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleUploadImage = async () => {
    try {
      const imageResult = await showImagePickerOptions();

      if (!imageResult) {
        return; //cancelled
      }

      setSelectedImage(imageResult);
      setPreviewUrl(imageResult.uri);

    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleSaveImage = async () => {
    if(selectedImage) {
      try {
        setIsUploading(true);

        const imageUrl = await uploadImageToStorage(selectedImage);

        if (onImageSave) {
          await onImageSave(imageUrl);
        }

        if (onImageChange) {
          onImageChange(imageUrl);
        }

        setIsModalVisible(false);
        setSelectedImage(null);
        setPreviewUrl(null);

        Alert.alert('Success', 'Profile picture updated successfully!');

      } catch (error) {
        console.error('Error saving image:', error);
        Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
    else {
      return;
    }

  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const modalImageUrl = previewUrl || avatarUrl;

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar
          rounded
          size={avatarSize}
          source={{ uri: avatarUrl }}
        />
        <TouchableOpacity
          style={[styles.expandButton, { backgroundColor: colors.primary }]}
          onPress={handleExpandPress}
        >
          <Feather name="maximize-2" size={16} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalDismiss}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleModalDismiss}
        >
          <View style={styles.modalContent}>
            <CloseButton
              onPress={handleModalDismiss}
              position="absolute"
              size="medium"
            />

            <Avatar
              rounded
              size={Math.min(screenWidth * 0.8, screenHeight * 0.6)}
              source={{ uri: modalImageUrl }}
              containerStyle={styles.modalAvatar}
            />

            <View style={styles.buttonContainer}>
              {!selectedImage ? (
                // Show Upload Image button when no image is selected
                <Button
                  title="Upload Image"
                  onPress={handleUploadImage}
                  buttonStyle={[styles.changeButton, { backgroundColor: colors.primary }]}
                  titleStyle={[styles.changeButtonText, { color: colors.surface }]}
                />
              ) : (
                <View style={styles.buttonRow}>
                  <Button
                    title="Cancel"
                    onPress={handleCancelImage}
                    buttonStyle={[styles.cancelButton, { backgroundColor: colors.surfaceVariant }]}
                    titleStyle={[styles.changeButtonText, { color: colors.text }]}
                    containerStyle={styles.buttonSpacing}
                  />
                  <Button
                    title={isUploading ? "Saving..." : "Save Image"}
                    onPress={handleSaveImage}
                    disabled={isUploading}
                    buttonStyle={[styles.saveButton, { backgroundColor: colors.primary }]}
                    titleStyle={[styles.changeButtonText, { color: colors.surface }]}
                    loading={isUploading}
                    containerStyle={styles.buttonSpacing}
                  />
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
  },
  expandButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    padding: spacing(5),
    position: 'relative',
  },

  modalAvatar: {
    marginBottom: spacing(5),
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButton: {
    paddingHorizontal: spacing(7.5),
    paddingVertical: spacing(3),
    borderRadius: BorderRadius.sm,
  },
  saveButton: {
    paddingHorizontal: spacing(7.5),
    paddingVertical: spacing(3),
    borderRadius: BorderRadius.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing(7.5),
    paddingVertical: spacing(3),
    borderRadius: BorderRadius.sm,
  },
  changeButtonText: {
    ...Typography.button,
  },
  buttonSpacing: {
    marginHorizontal: spacing(2),
  },
});
