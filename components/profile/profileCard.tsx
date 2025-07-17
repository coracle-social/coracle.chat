import { View, StyleSheet, TextInput, Dimensions, Platform, TouchableWithoutFeedback, Keyboard, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { Button } from '@rneui/themed';
import { useTheme } from '@/components/theme/ThemeContext';
import Colors from '@/constants/Colors';
import ProfilePicture from './ProfilePicture';
import { updateProfile, changePicture } from '@/utils/dataHandling';
import DisplayCopyString from '@/components/generalUI/DisplayCopyString';
import { isMobile as isMobileBreakpoint } from '@/constants/Breakpoints';
import { useStore } from '@/stores/useWelshmanStore2';
import { pubkey, userProfile } from '@welshman/app';
import { displayProfile, displayPubkey } from '@welshman/util';

export default function ProfileCard() {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const [currentPubkey] = useStore(pubkey);
  const [profile] = useStore(userProfile);

  const [aboutText, setAboutText] = useState(profile?.about || '');
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [nameText, setNameText] = useState(profile?.name || '');

  useEffect(() => {
    setAboutText(profile?.about || '');
    setNameText(profile?.name || '');
  }, [profile]);

  const screenWidth = Dimensions.get('window').width;
  const isMobile = isMobileBreakpoint(screenWidth);
  const isWeb = Platform.OS === 'web';

  const avatarSize = isMobile ? 120 : 90;
  const verticalPadding = isMobile ? 28 : 20;

  const saveButtonFontSize = isMobile ? 12 : 14;
  const saveButtonPaddingVertical = isMobile ? 6 : 8;
  const saveButtonPaddingHorizontal = isMobile ? 16 : 20;

  const handleAboutChange = (text: string) => {
    setAboutText(text);
  };

  const handleImageChange = (newImageUrl: string) => {
    console.log('Profile image changed to:', newImageUrl);
    // UI will update automatically through the store
  };

  const handleImageSave = async (newImageUrl: string) => {
    try {
      await changePicture(newImageUrl);
    } catch (error) {
      console.error('Failed to save profile picture:', error);
      throw error;
    }
  };

  const dismissKeyboard = () => {
    if (!isWeb) {
      Keyboard.dismiss();
    }
  };

  const handleSaveName = async () => {
    try {
      await updateProfile({ name: nameText.trim() });
      setEditingName(false);
    } catch (error) {
      console.error('Failed to save name:', error);
    }
  };

  const handleSaveDescription = async () => {
    try {
      await updateProfile({ about: aboutText.trim() });
      setEditingDescription(false);
    } catch (error) {
      console.error('Failed to save description:', error);
    }
  };

  // Don't render if no user is logged in
  if (!currentPubkey) {
    return null;
  }

  const cardContent = (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        paddingVertical: verticalPadding
      }
    ]}>
      <View style={styles.leftSide}>
        <View style={styles.pubkeyContainer}>
          <DisplayCopyString
            value={currentPubkey}
            onCopy={(value) => console.log('Public key copied:', value)}
          />
        </View>

        <View style={styles.aboutContainer}>
          <TextInput
            style={[
              styles.aboutInput,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surfaceVariant,
              }
            ]}
            multiline
            placeholder="About..."
            placeholderTextColor={colors.placeholder}
            value={aboutText}
            onChangeText={handleAboutChange}
            textAlignVertical="top"
            onFocus={() => setEditingDescription(true)}
          />
          {editingDescription && (
            <Button
              title="Save"
              onPress={handleSaveDescription}
              buttonStyle={[
                styles.saveDescriptionButton,
                {
                  backgroundColor: colors.primary,
                  paddingVertical: saveButtonPaddingVertical,
                  paddingHorizontal: saveButtonPaddingHorizontal,
                  borderRadius: 6,
                }
              ]}
              titleStyle={{ color: colors.surface, fontSize: saveButtonFontSize }}
              containerStyle={styles.saveDescriptionButtonContainer}
            />
          )}
        </View>
      </View>

      <View style={styles.rightSide}>
        <ProfilePicture
          avatarUrl={profile?.picture || "https://via.placeholder.com/90"}
          size={avatarSize}
          onImageChange={handleImageChange}
          onImageSave={handleImageSave}
        />
        {editingName ? (
          <>
            <TextInput
              value={nameText}
              onChangeText={setNameText}
              style={[
                styles.nameInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceVariant,
                }
              ]}
              placeholder="Your Name"
              placeholderTextColor={colors.placeholder}
            />
            <Button
              title="Save"
              onPress={handleSaveName}
              buttonStyle={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  paddingVertical: saveButtonPaddingVertical,
                  paddingHorizontal: saveButtonPaddingHorizontal,
                  borderRadius: 6,
                  height: 'auto',
                }
              ]}
              titleStyle={{ color: colors.surface, fontSize: saveButtonFontSize }}
              containerStyle={{ marginTop: 8 }}
            />
          </>
        ) : (
          <Text
            style={[styles.nameText, { color: colors.text }]}
            onPress={() => setEditingName(true)}
          >
            {displayProfile(profile, displayPubkey(currentPubkey))}
          </Text>
        )}
      </View>
    </View>
  );

  if (isWeb) {
    return cardContent;
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      {cardContent}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    marginHorizontal: 16,
  },
  leftSide: {
    flex: 1,
    marginRight: 20,
  },
  ovalButton: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 20,
  },
  buttonTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  aboutInput: {
    flex: 1,
    minHeight: 100,
    maxHeight: 140,
    maxWidth: 600,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
  },
  rightSide: {
    alignItems: 'center',

    maxWidth: 300,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  nameInput: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    width: 140,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 1,
    height: 20,
  },
  aboutContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: 600,
  },
  saveDescriptionButton: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveDescriptionButtonContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    maxWidth: 100,
    zIndex: 2,
  },
  pubkeyContainer: {
    marginBottom: 16,
    maxWidth: 600,           //pubkey width matches description
  },
});
