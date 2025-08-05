// abort-signal-polyfill.ts
if (!AbortSignal.timeout) {
  AbortSignal.timeout = function timeout(ms: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

if (!AbortSignal.any) {
  AbortSignal.any = function any(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener("abort", () => controller.abort(), { once: true });
      }
    }

    return controller.signal;
  };
}
