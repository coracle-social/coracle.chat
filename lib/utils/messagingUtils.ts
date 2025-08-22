import { pubkey, repository, sendWrapped } from '@welshman/app';
import { load } from '@welshman/net';
import { deriveEvents } from '@welshman/store';
import { DIRECT_MESSAGE, DIRECT_MESSAGE_FILE, makeEvent } from '@welshman/util';
import { getRelayUrls } from './relayLoadingUtils';

export const chatMessages = deriveEvents(repository, {
    filters: [{kinds: [DIRECT_MESSAGE, DIRECT_MESSAGE_FILE ]}]
})

export interface Room {
  id: string;
  name: string;
  description?: string;
  created_at: number;
  message_count: number;
  last_activity: number;
  tags: string[];
}

export interface RoomMessage {
  id: string;
  content: string;
  author: string;
  room_id: string;
  created_at: number;
  tags: string[][];
}

export const getRoomMessageCount = async (roomId: string): Promise<number> => {
    try {
      const relays = getRelayUrls({ preferSearch: false, limit: 12 });
      await load({
        filters: [
          { kinds: [42], '#h': [roomId] },
          { kinds: [42], '#r': [roomId] }
        ],
        relays,
      });

      const hTagMessages = repository.query([{ kinds: [42], '#h': [roomId] }]);
      const rTagMessages = repository.query([{ kinds: [42], '#r': [roomId] }]);

      // Merge and deduplicate by event ID
      const allMessagesMap = new Map<string, any>();
      [...hTagMessages, ...rTagMessages].forEach(event => {
        allMessagesMap.set(event.id, event);
      });

      const uniqueMessages = Array.from(allMessagesMap.values());

      return uniqueMessages.length;
    } catch (error) {
      console.error('Error getting room message count:', error);
      return 0;
    }
  };

export const getRooms = async (limit: number = 1000): Promise<Room[]> => {
  try {
    await load({
      filters: [{kinds: [40]}],
      relays: getRelayUrls({ preferSearch: false, limit: 12 }),
    });

    // Query the repository for room events
    const roomEvents = repository.query([{
      kinds: [40],  // ROOMS
      limit: limit
    }]);

    const rooms = roomEvents
      .filter(event => {
        // Only include events that have a #d tag
        return event.tags.some(tag => tag[0] === 'd');
      })
      .map(event => {
        try {
          const metadata = JSON.parse(event.content);
          return {
            id: metadata.room_id || event.id,
            name: metadata.name,
            description: metadata.about || metadata.description,
            created_at: metadata.created_at,
            message_count: 0,
            last_activity: event.created_at,
            tags: metadata.tags || []
          };
        } catch (error) {
          console.log('Filtered out event (JSON parse error):', event.content.substring(0, 100));
          return null;
        }
      })
      .filter(room => room !== null)
      // Remove duplicates based on room ID or name
      .filter((room, index, self) =>
        index === self.findIndex(r => r.id === room.id || r.name === room.name)
      )
      .sort((a, b) => b!.last_activity - a!.last_activity)
      .slice(0, limit) as Room[];

    return rooms;
  } catch (error) {
    console.error('Error getting rooms:', error);
    return [];
  }
};
export const createChat = async (recipientPubkey: string) => {
    const currentPubkey = pubkey.get()
    if (!currentPubkey) {
      throw new Error('User not authenticated')
    }
    const chatId = makeChatId([currentPubkey, recipientPubkey])
    console.log('Chat created:', chatId)
    return chatId
  }

  export const sendTextMessage = async (content: string, recipients: string[]) => {
    if (!content.trim()) return

    const template = makeEvent(DIRECT_MESSAGE, {
      content: content.trim(),
      tags: recipients.map(pubkey => ['p', pubkey])
    })

    await sendWrapped({
      pubkeys: recipients,
      template
    })
  }

  export const loadMessages = (chatId: string) => {
    const participants = splitChatId(chatId)

    return deriveEvents(repository, {
      filters: [{
        kinds: [DIRECT_MESSAGE],
        '#p': participants
      }]
    })
  }

  export const makeChatId = (pubkeys: string[]): string => {
    if (pubkeys.length !== 2) {
      throw new Error("Chat ID requires exactly 2 pubkeys")
    }

    // Sort pubkeys alphabetically for consistent chat ID
    const sortedPubkeys = [...pubkeys].sort()
    return sortedPubkeys.join(":")
  }

  export const splitChatId = (chatId: string): string[] => {
    const parts = chatId.split(":")
    if (parts.length !== 2) {
      throw new Error("Invalid chat ID format")
    }
    return parts
  }

  /**
   * Derives a chat store for a given chat ID
   */
  export const deriveChat = (chatId: string) => {
    const participants = splitChatId(chatId)

    return deriveEvents(repository, {
      filters: [{
        kinds: [DIRECT_MESSAGE, DIRECT_MESSAGE_FILE],
        "#p": participants
      }]
    })
  }
