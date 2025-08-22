import { Text, useThemeColor } from '@/lib/theme/Themed';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import './tiptap-styles.css';

interface MessageEditorProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export interface MessageEditorRef {
  dismissKeyboard: () => void;
}

const MessageEditor = forwardRef<MessageEditorRef, MessageEditorProps>(({ onSendMessage, disabled = false }, ref) => {

  // Use the theme system properly
  const backgroundColor = useThemeColor('surface');
  const borderColor = useThemeColor('border');
  const textColor = useThemeColor('text');
  const placeholderColor = useThemeColor('placeholder');
  const primaryColor = useThemeColor('primary');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type youdr message...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => {
      // Handle content changes if needed
    },
    editable: !disabled,
  });

  // Update CSS variables when theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--editor-background', backgroundColor);
      root.style.setProperty('--editor-border', borderColor);
      root.style.setProperty('--editor-text', textColor);
      root.style.setProperty('--editor-placeholder', placeholderColor);
      console.log('Theme colors:', { backgroundColor, borderColor, textColor, placeholderColor });
    }
  }, [backgroundColor, borderColor, textColor, placeholderColor]);

  useImperativeHandle(ref, () => ({
    dismissKeyboard: () => {
      // Web doesn't need special keyboard dismissal
      editor?.commands.blur();
    }
  }));

  const handleSendMessage = () => {
    if (editor && editor.getText().trim() && !disabled) {
      const content = editor.getHTML();
      onSendMessage(content);
      editor.commands.clearContent();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <View style={styles.webInputContainer}>
      <View style={[styles.editorWrapper, { backgroundColor, borderColor }]}>
        <EditorContent
          editor={editor}
          className="tiptap-editor"
          onKeyDown={handleKeyPress}
        />
      </View>
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
    </View>
  );
});

export default MessageEditor;

const styles = StyleSheet.create({
  webInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  editorWrapper: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 40,
    maxHeight: 200,
  },
  sendButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
