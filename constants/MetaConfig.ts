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
  DEFAULT_RELAYS: ["wss://relay.damus.io/", "wss://nos.lol/"]

} as const;

export const getDnsPrefetchLinks = () => {
  return MetaConfig.DEFAULT_RELAYS.map(relay =>
    `//${relay}`
  );
};