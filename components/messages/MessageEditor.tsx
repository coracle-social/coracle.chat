import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useThemeColor } from '@/components/theme/Themed';
import { useTheme } from '@/components/theme/ThemeContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import './tiptap-styles.css';

interface MessageEditorProps {
  onSendMessage: (content: string) => void;
}

export interface MessageEditorRef {
  dismissKeyboard: () => void;
}

const MessageEditor = forwardRef<MessageEditorRef, MessageEditorProps>(({ onSendMessage }, ref) => {
  const { isDark } = useTheme();
  
  // Use the theme system properly
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const primaryColor = useThemeColor({}, 'primary');
  
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
    if (editor && editor.getText().trim()) {
      const content = editor.getHTML();
      onSendMessage(content);
      editor.commands.clearContent();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      <Pressable style={[styles.sendButton, { backgroundColor: primaryColor }]} onPress={handleSendMessage}>
        <Text style={styles.sendButtonText}>Send</Text>
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