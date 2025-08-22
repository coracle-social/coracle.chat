import { Text, useThemeColor } from '@/lib/theme/Themed';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';

const RichEditorModule = require('react-native-pell-rich-editor');
const RichEditor = RichEditorModule.RichEditor;
const RichToolbar = RichEditorModule.RichToolbar;
const actions = RichEditorModule.actions;

interface MessageEditorProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export interface MessageEditorRef {
  dismissKeyboard: () => void;
}

const MessageEditor = forwardRef<MessageEditorRef, MessageEditorProps>(({ onSendMessage, disabled = false }, ref) => {
  const richText = useRef<{
    blurContentEditor?: () => void;
    getContentHtml?: () => Promise<string>;
    setContentHTML?: (html: string) => void;
  }>(null);

  // Use the theme system properly
  const backgroundColor = useThemeColor('surface');
  const borderColor = useThemeColor('border');
  const textColor = useThemeColor('text');
  const placeholderColor = useThemeColor('placeholder');
  const primaryColor = useThemeColor('primary');
  const toolbarBackground = useThemeColor('surfaceVariant');

  useImperativeHandle(ref, () => ({
    dismissKeyboard: () => {
      if (richText.current) {
        richText.current.blurContentEditor?.();
      }
    }
  }));

  const handleSendMessage = () => {
    if (disabled) return;

    richText.current?.getContentHtml?.().then((content: string) => {
      if (content && content.trim() !== '<p><br></p>') {
        onSendMessage(content);
        richText.current?.setContentHTML?.('');
      }
    });
  };

  const handleEditorChange = (text: string) => {
    if (disabled) return;

    // Check if the text contains a newline (Enter key was pressed)
    if (text.includes('\n')) {
      // Remove the newline and send the message
      const cleanText = text.replace(/\n/g, '');
      if (cleanText.trim()) {
        onSendMessage(cleanText);
        richText.current?.setContentHTML?.('');
      }
    }
  };

  return (
    <>
      <RichEditor
        ref={richText}
        style={[styles.editor, { backgroundColor, borderColor }]}
        placeholder="Type your message..."
        onChange={handleEditorChange}
        maxHeight={200}
        scrollEnabled={!disabled}
        editorStyle={{
          backgroundColor: backgroundColor,
          color: textColor,
          fontSize: 16,
          lineHeight: 1.5,
        }}
        placeholderColor={placeholderColor}
        disabled={disabled}
      />
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
        ]}
        style={[styles.toolbar, { backgroundColor: toolbarBackground, borderTopColor: borderColor }]}
      />
      <Pressable
        style={[
          styles.sendButton,
          {
            backgroundColor: disabled ? placeholderColor : primaryColor,
            opacity: disabled ? 0.5 : 1
          }
        ]}
        onPress={handleSendMessage}
        disabled={disabled}
      >
        <Text style={styles.sendButtonText}>
          {disabled ? 'Publishing...' : 'Send'}
        </Text>
      </Pressable>
    </>
  );
});

export default MessageEditor;

const styles = StyleSheet.create({
  editor: {
    minHeight: 100,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  toolbar: {
    borderTopWidth: 1,
  },
  sendButton: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
