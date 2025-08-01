import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import MessageEditor, { MessageEditorRef } from '@/components/messages/MessageEditor';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';

//to be changed, doesn't show rich text yet
interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messageEditorRef = useRef<MessageEditorRef>(null);
  const colors = useThemeColors();

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };
  //for mobile
  const dismissKeyboard = () => {
    messageEditorRef.current?.dismissKeyboard();
  };

  const content = (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={[styles.keyboardAvoidingView, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat History */}
        <ScrollView style={[styles.messagesContainer, { backgroundColor: colors.background }]}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageBubble, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.messageText, { color: colors.text }]}>
                {Platform.OS === 'web' ? message.content : message.content.replace(/<[^>]*>/g, '')}
              </Text>
              <Text style={[styles.timestamp, { color: colors.placeholder }]}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Text Input - Platform-specific editor based on .web or .mobile*/}
        <View style={[styles.editorContainer, { borderTopColor: colors.border }]}>
          <MessageEditor ref={messageEditorRef} onSendMessage={handleSendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
  editorContainer: {
    borderTopWidth: 1,
    padding: 10,
  },
});

// when you create a message it gets sent to the repository automatically, updating the message list in the process.
