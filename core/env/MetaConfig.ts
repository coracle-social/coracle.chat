export const AppConfig = {
  APP_NAME: "Coracle",
  APP_NAME_FULL: "Coracle Chat",
  APP_DESCRIPTION: "Decentralized Social Platform",
} as const;

export const MetaConfig = {
  NAME: `${AppConfig.APP_NAME_FULL} - ${AppConfig.APP_DESCRIPTION}`,
  DESCRIPTION: "Join communities, discuss articles, and plan events on the decentralized social platform built on Nostr protocol. Maintain your identity across platforms with cryptographic keys.",
  URL: "https://coracle.chat",

  ACCENT: "#007AFF",

  OG_IMAGE: "https://coracle.chat/og-image.png", //doesn't exist yet, will likely be puleed from blossom??
  TWITTER_IMAGE: "/maskable-icon-512x512.png",

  OG_IMAGE_WIDTH: "1200",
  OG_IMAGE_HEIGHT: "630",
  OG_SITE_NAME: AppConfig.APP_NAME_FULL,
  OG_LOCALE: "en_US",

  TWITTER_CARD_TYPE: "summary",

  // Default Nostr relays for DNS prefetch, how can I test if this actually helps/measure its effect?
  DEFAULT_RELAYS: ["wss://relay.damus.io/", "wss://nos.lol/"],

  // Search-optimized relays for better search results
  SEARCH_RELAYS: [
    "wss://search.nos.today/",
    "wss://relay.nostr.band/",
    "wss://relay.damus.io/",
    "wss://nos.lol/"
  ],

  // Messaging-optimized relays for room operations
  MESSAGING_RELAYS: [
    "wss://purplepag.es",       // ✅ Coracle's main room metadata relay
    "wss://relayable.org",      // ✅ Frequently used for bots/rooms
    "wss://nostr.mutinywallet.com",
      'wss://purplepag.es',
      'wss://relayable.org',
      'wss://nostr.fmt.wiz.biz',
      'wss://coracle.social',
      'wss://relay.nostr.band',        // keep this
      'wss://nos.lol',                 // keep this
  ]

} as const;

export const getDnsPrefetchLinks = () => {
  return [...MetaConfig.DEFAULT_RELAYS, ...MetaConfig.SEARCH_RELAYS].map(relay =>
    `//${relay}`
  );
};

// Public relays for profile loading and fallback

export const PUBLIC_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://offchain.pub',
  'wss://relay.nostr.band',
  'wss://relayable.org',
  'wss://relay.nostr.wirednet.jp',
  'wss://nostr.wine',
  'wss://relay.nostr.info',
  'wss://relay.nostr.com',
  'wss://nostr.bitcoiner.social',
  'wss://relay.nostr.net'
];
