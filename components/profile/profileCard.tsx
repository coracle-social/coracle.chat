import { View, StyleSheet, TextInput, Dimensions, Platform, TouchableWithoutFeedback, Keyboard, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { Button } from '@rneui/themed';
import { useTheme } from '@/components/theme/ThemeContext';
import Colors from '@/constants/Colors';
import ProfilePicture from './ProfilePicture';
import { changeName, changeDescription } from '@/utils/dataHandling';
import DisplayCopyString from './DisplayCopyString';

interface ProfileCardProps {
  avatarUrl: string;
  buttonTitle: string;
  aboutText: string;
  name?: string;
  pubkey?: string;
  onButtonPress: () => void;
  onAboutChange?: (text: string) => void;
  slideOutButtons?: Array<{
    title: string;
    onPress: () => void;
    icon?: string;
    iconType?: string;
    color?: string;
  }>;
}

export default function ProfileCard({
  avatarUrl,
  buttonTitle, //for future use
  aboutText: initialAboutText,
  name,
  pubkey,
  onButtonPress,
  onAboutChange,
}: ProfileCardProps) {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  
  const [aboutText, setAboutText] = useState(initialAboutText);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [nameText, setNameText] = useState(name || '');

  useEffect(() => {
    setAboutText(initialAboutText);
  }, [initialAboutText]);

  useEffect(() => {
    if (name) setNameText(name);
  }, [name]);

  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  const isWeb = Platform.OS === 'web';
  
  const avatarSize = isMobile ? 120 : 90;
  const verticalPadding = isMobile ? 28 : 20;

  // Responsive button sizes
  const saveButtonFontSize = isMobile ? 12 : 14;
  const saveButtonPaddingVertical = isMobile ? 6 : 8;
  const saveButtonPaddingHorizontal = isMobile ? 16 : 20;

  const handleAboutChange = (text: string) => {
    setAboutText(text);
    if (onAboutChange) {
      onAboutChange(text);
    }
  };

  const handleImageChange = (newImageUrl: string) => {
    console.log('Profile image changed to:', newImageUrl);
    //for future use
  };

  const dismissKeyboard = () => {
    if (!isWeb) {
      Keyboard.dismiss();
    }
  };

  const handleSaveName = async () => {
    try {
      // Pass the full profile data to preserve all existing fields
      await changeName(nameText);
      setEditingName(false);
    } catch (error) {
      console.error('Failed to save name:', error);
    }
  };

  const handleSaveDescription = async () => {
    try {
      // Pass the full profile data to preserve all existing fields
      await changeDescription(aboutText);
      setEditingDescription(false);
    } catch (error) {
      console.error('Failed to save description:', error);
    }
  };
  
  const cardContent = (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.surface,
        paddingVertical: verticalPadding
      }
    ]}>
      <View style={styles.leftSide}>
        {pubkey && (
          <View style={styles.pubkeyContainer}>
            <DisplayCopyString
              value={pubkey}
              onCopy={(value) => console.log('Public key copied:', value)}
            />
          </View>
        )}
        
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
            editable={!!onAboutChange}
            onFocus={() => setEditingDescription(true)}
          />
          {editingDescription && onAboutChange && (
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
          avatarUrl={avatarUrl} 
          size={avatarSize} 
          onImageChange={handleImageChange}
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
            {nameText || 'Your Name'}
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
