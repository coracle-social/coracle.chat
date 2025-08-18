import { neventEncode } from "nostr-tools/nip19";
//mostly nonfunctional until we have full context viewing for events
/**
 * @param eventId - The hex event ID to encode
 * @param relays - Optional array of relay URLs to include
 * @returns The NIP-19 encoded event string
 */
export const encodeEventId = (eventId: string, relays: string[] = []): string => {
  const encoded = neventEncode({
    id: eventId,
    relays: relays,
  });
  return encoded || eventId;
};

export const createConversationUrl = (eventId: string, relays: string[] = []): string => {
  const encodedEvent = encodeEventId(eventId, relays);
  return `/${encodedEvent}`;
};
