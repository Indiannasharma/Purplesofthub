export interface PaystackSDK {
  setup(config: {
    callback: (response: { reference: string }) => Promise<void>;
    onClose: () => void;
    [key: string]: unknown;
  }): { openIframe(): void };
}

let pending: Promise<PaystackSDK> | null = null;

/** Programmatic v1 loading: data-* attributes accidentally enable form embedding. */
export function loadPaystack(): Promise<PaystackSDK> {
  if (typeof window === "undefined") return Promise.reject(new Error("Paystack requires a browser."));
  const sdk = () => (window as Window & { PaystackPop?: PaystackSDK }).PaystackPop;
  const existing = sdk();
  if (typeof existing?.setup === "function") return Promise.resolve(existing);
  if (pending) return pending;

  const request = new Promise<PaystackSDK>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "psh-paystack-inline";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.referrerPolicy = "no-referrer";
    const finish = (error?: Error) => {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      const loaded = sdk();
      if (error || typeof loaded?.setup !== "function") {
        script.remove();
        reject(error || new Error("Paystack did not initialize."));
      } else resolve(loaded);
    };
    const timeout = window.setTimeout(() => finish(new Error("Paystack loading timed out.")), 15000);
    script.onload = () => finish();
    script.onerror = () => finish(new Error("Paystack could not be loaded."));
    // Do not use next/script or attach data-nscript/data-* attributes here.
    try { document.head.appendChild(script); }
    catch { finish(new Error("Paystack could not be loaded.")); }
  });
  pending = request;
  void request.catch(() => { if (pending === request) pending = null; });
  return request;
}
