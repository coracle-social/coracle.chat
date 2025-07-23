import { ScrollViewStyleReset } from 'expo-router/html';
import { MetaConfig, getDnsPrefetchLinks} from '@/core/env/MetaConfig';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <meta httpEquiv="Content-Security-Policy" content="
          form-action 'self';
          frame-ancestors 'none';
          upgrade-insecure-requests;
        " />


        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />

        <meta name="theme-color" content={MetaConfig.ACCENT} />
        <meta name="description" content={MetaConfig.DESCRIPTION} />
        <meta name="og:url" content={MetaConfig.URL} />
        <meta name="og:type" content="website" />
        <meta name="og:title" content={MetaConfig.NAME} />
        <meta name="og:description" content={MetaConfig.DESCRIPTION} />
        <meta name="twitter:card" content={MetaConfig.TWITTER_CARD_TYPE} />
        <meta name="twitter:site" content={MetaConfig.URL} />
        <meta name="twitter:title" content={MetaConfig.NAME} />
        <meta name="twitter:description" content={MetaConfig.DESCRIPTION} />
        <meta name="twitter:image" content={MetaConfig.TWITTER_IMAGE} />

        {/* DNS Prefetch for Nostr relays - helps establish connections faster */}
        {getDnsPrefetchLinks().map((relay, index) => (
          <link key={index} rel="dns-prefetch" href={relay} />
        ))}
        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />

      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
