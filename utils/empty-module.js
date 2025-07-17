// Empty module to replace nostr-signer-capacitor-plugin
// This is used because the Capacitor plugin is not compatible with React Native/Expo

export const NostrSignerPlugin = {
  getInstalledSignerApps: async () => ({ apps: [] }),
  setPackageName: async () => {},
  getPublicKey: async () => ({ npub: '' }),
  signEvent: async () => ({ event: '{}' }),
  nip04Encrypt: async () => ({ result: '' }),
  nip04Decrypt: async () => ({ result: '' }),
  nip44Encrypt: async () => ({ result: '' }),
  nip44Decrypt: async () => ({ result: '' }),
};

export const AppInfo = {};

export default NostrSignerPlugin;