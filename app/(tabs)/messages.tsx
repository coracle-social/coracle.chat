import { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { Text } from '@/lib/theme/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import MessageEditor, { MessageEditorRef } from '@/components/messages/MessageEditor';

//to be changed, doesn't show rich text yet
interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messageEditorRef = useRef<MessageEditorRef>(null);

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat History */}
        <ScrollView style={styles.messagesContainer}>
          {messages.map((message) => (
            <View key={message.id} style={styles.messageBubble}>
              <Text style={styles.messageText}>
                {Platform.OS === 'web' ? message.content : message.content.replace(/<[^>]*>/g, '')}
              </Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Text Input - Platform-specific editor based on .web or .mobile*/}
        <View style={styles.editorContainer}>
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
    backgroundColor: '#e3f2fd',
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
    color: '#666',
    marginTop: 5,
  },
  editorContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 10,
  },
});

// when you create a message it gets sent to the repository automatically, updating the message list in the process.