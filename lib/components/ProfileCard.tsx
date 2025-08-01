import { BorderRadius } from '@/core/env/BorderRadius';
import { isMobile as isMobileBreakpoint } from '@/core/env/Breakpoints';
import { ComponentStyles } from '@/core/env/ComponentStyles';
import { spacing } from '@/core/env/Spacing';
import { Typography } from '@/core/env/Typography';
import { PubkeyDisplay } from '@/lib/components/PubkeyDisplay';
import { StandardTextInput } from '@/lib/components/StandardTextInput';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { changePicture, updateProfile } from '@/lib/utils/dataHandling';
import { Button } from '@rneui/themed';
import { pubkey, userProfile } from '@welshman/app';
import { displayProfile, displayPubkey } from '@welshman/util';
import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import ProfilePicture from './ProfilePicture';

export default function ProfileCard() {
  const colors = useThemeColors();

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
    //kept for possible UI like confetti
  };

  const handleImageSave = async (newImageUrl: string) => {
    await changePicture(newImageUrl);
  };

  const dismissKeyboard = () => {
    if (!isWeb) {
      Keyboard.dismiss();
    }
  };

  const handleSaveName = async () => {
    await updateProfile({ name: nameText.trim() });
    setEditingName(false);
  };

  const handleSaveDescription = async () => {
    await updateProfile({ about: aboutText.trim() });
    setEditingDescription(false);
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
          <PubkeyDisplay
            pubkey={currentPubkey}
            showLabel={false}
          />
        </View>

        <View style={styles.aboutContainer}>
          <StandardTextInput
            style={[
              styles.aboutInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.surfaceVariant,
              }
            ]}
            multiline
            placeholder="About..."
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
            <StandardTextInput
              value={nameText}
              onChangeText={setNameText}
              style={[
                styles.nameInput,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceVariant,
                }
              ]}
              placeholder="Your Name"
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
    paddingHorizontal: spacing(6),
    alignItems: 'center',
    ...ComponentStyles.cardLarge,
    marginHorizontal: spacing(4),
  },
  leftSide: {
    flex: 1,
    marginRight: spacing(5),
  },
  ovalButton: {
    height: 36,
    borderRadius: BorderRadius.round,
    paddingHorizontal: spacing(5),
  },
  buttonTitle: {
    ...Typography.label,
  },
  buttonContainer: {
    alignSelf: 'flex-start',
    marginBottom: spacing(4),
  },
  aboutInput: {
    flex: 1,
    minHeight: 100,
    maxHeight: 140,
    maxWidth: 600,
    ...ComponentStyles.input,
  },
  rightSide: {
    alignItems: 'center',
    maxWidth: 300,
  },
  nameText: {
    ...Typography.button,
    marginTop: spacing(2),
    textAlign: 'center',
  },
  nameInput: {
    marginTop: spacing(2),
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    fontSize: 14,
    fontWeight: '500',
    width: 140,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(0.25),
    height: 20,
  },
  aboutContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: 600,
  },
  saveDescriptionButton: {
    borderRadius: BorderRadius.xs,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  saveDescriptionButtonContainer: {
    position: 'absolute',
    bottom: spacing(2),
    right: spacing(2),
    maxWidth: 100,
    zIndex: 2,
  },
  pubkeyContainer: {
    marginBottom: spacing(4),
    maxWidth: 600,           //pubkey width matches description
  },
});
