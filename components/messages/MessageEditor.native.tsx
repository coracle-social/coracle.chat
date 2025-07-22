import { useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Text, useThemeColor } from '@/lib/theme/Themed';

const RichEditorModule = require('react-native-pell-rich-editor');
const RichEditor = RichEditorModule.RichEditor;
const RichToolbar = RichEditorModule.RichToolbar;
const actions = RichEditorModule.actions;

interface MessageEditorProps {
  onSendMessage: (content: string) => void;
}

export interface MessageEditorRef {
  dismissKeyboard: () => void;
}

const MessageEditor = forwardRef<MessageEditorRef, MessageEditorProps>(({ onSendMessage }, ref) => {
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
    richText.current?.getContentHtml?.().then((content: string) => {
      if (content && content.trim() !== '<p><br></p>') {
        onSendMessage(content);
        richText.current?.setContentHTML?.('');
      }
    });
  };

  const handleEditorChange = (text: string) => {
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
        scrollEnabled={true}
        editorStyle={{
          backgroundColor: backgroundColor,
          color: textColor,
          fontSize: 16,
          lineHeight: 1.5,
        }}
        placeholderColor={placeholderColor}
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
      <Pressable style={[styles.sendButton, { backgroundColor: primaryColor }]} onPress={handleSendMessage}>
        <Text style={styles.sendButtonText}>Send</Text>
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