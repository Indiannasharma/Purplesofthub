import { AnalyticsRuntime } from "./runtime";

type TagWindow = Window & { dataLayer?: (IArguments | unknown[])[]; gtag?: (...args: unknown[]) => void };

export function browserRuntime(id: string) {
  const tag = window as TagWindow;
  let pending: HTMLScriptElement | null = null;
  const runtime = new AnalyticsRuntime(id, {
    path: () => window.location.pathname,
    referrer: () => document.referrer,
    available: () => !document.querySelector('meta[name="robots"][content*="noindex"]'),
    disable: disabled => { (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = disabled; },
    load: (ready, failed) => {
      tag.dataLayer = tag.dataLayer || [];
      tag.gtag = tag.gtag || ((...args: unknown[]) => { tag.dataLayer?.push(args); });
      const script = document.createElement("script");
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      script.id = "psh-ga4";
      script.onload = () => { pending = null; ready(); };
      script.onerror = () => { pending = null; script.remove(); failed(); };
      pending = script;
      document.head.appendChild(script);
    },
    cancelPending: () => { if (pending) { pending.onload = null; pending.onerror = null; pending.remove(); pending = null; } },
    send: (...args) => tag.gtag?.(...args),
    clearCookies: () => {
      for (const entry of document.cookie.split(";")) {
        const name = entry.trim().split("=")[0];
        if (name !== "_ga" && name !== `_ga_${id.slice(2)}`) continue;
        for (const domain of ["", window.location.hostname, ".purplesofthub.com"]) {
          document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
        }
      }
    },
  });
  return runtime;
}

/** Disable the loaded tag before history changes, rather than waiting for a React effect. */
export function guardNavigation(runtime: AnalyticsRuntime) {
  const originalPush = history.pushState;
  const originalReplace = history.replaceState;
  let lastPath = location.pathname;
  const before = (url?: string | URL | null) => {
    if (url != null) {
      try { if (new URL(String(url), location.href).pathname !== location.pathname) runtime.beforeNavigation(); }
      catch { runtime.beforeNavigation(); }
    }
  };
  const push: History["pushState"] = function (this: History, data, unused, url) { before(url); const result = originalPush.call(this, data, unused, url); lastPath = location.pathname; return result; };
  const replace: History["replaceState"] = function (this: History, data, unused, url) { before(url); const result = originalReplace.call(this, data, unused, url); lastPath = location.pathname; return result; };
  history.pushState = push;
  history.replaceState = replace;
  const pop = () => { if (lastPath !== location.pathname) runtime.beforeNavigation(); lastPath = location.pathname; };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!anchor || anchor.download || (anchor.target && anchor.target !== "_self")) return;
    before(anchor.href);
  };
  window.addEventListener("popstate", pop);
  document.addEventListener("click", click, true);
  return () => {
    if (history.pushState === push) history.pushState = originalPush;
    if (history.replaceState === replace) history.replaceState = originalReplace;
    window.removeEventListener("popstate", pop);
    document.removeEventListener("click", click, true);
    runtime.stop();
  };
}
