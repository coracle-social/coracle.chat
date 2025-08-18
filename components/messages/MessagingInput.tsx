import { useRef } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import MessageEditor, { MessageEditorRef } from '@/components/messages/MessageEditor';
import { useThemeColors } from '@/lib/theme/ThemeContext';

interface MessagingInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function MessagingInput({ onSendMessage, disabled = false }: MessagingInputProps) {
  const messageEditorRef = useRef<MessageEditorRef>(null);
  const colors = useThemeColors();

  //for mobile
  const dismissKeyboard = () => {
    messageEditorRef.current?.dismissKeyboard();
  };

  const content = (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingView, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Text Input - Platform-specific editor based on .web or .mobile*/}
      <View style={[styles.editorContainer, { borderTopColor: colors.border }]}>
        <MessageEditor
          ref={messageEditorRef}
          onSendMessage={onSendMessage}
          disabled={disabled}
        />
      </View>
    </KeyboardAvoidingView>
  );

  return Platform.OS === 'web' ? (
    content
  ) : (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      {content}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  editorContainer: {
    borderTopWidth: 1,
    padding: 10,
  },
});
