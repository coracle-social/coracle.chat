import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions, Pressable, Platform, Alert } from 'react-native';
import { Avatar, Button } from '@rneui/themed';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '@/lib/theme/ThemeContext';
import Colors from '@/core/env/Colors';
import { showImagePickerOptions, uploadImageToStorage, ImageUploadResult } from '@/core/commands/imageUpload';

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
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

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
            {isWeb && (
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={handleModalDismiss}
              >
                <Feather name="x" size={20} color={colors.text} />
              </TouchableOpacity>
            )}

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
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  modalAvatar: {
    marginBottom: 20,
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
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSpacing: {
    marginHorizontal: 8,
  },
});