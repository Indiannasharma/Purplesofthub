export {};

declare global {
  interface Window {
    Tawk_API?: {
      toggle: () => void;
      setAttributes: (attrs: object, callback?: (error: unknown) => void) => void;
      onLoad?: () => void;
      maximize?: () => void;
      minimize?: () => void;
    };
  }
}
