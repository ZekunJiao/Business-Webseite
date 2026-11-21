// Minimale Typen für HTMLRewriter aus der Cloudflare-Laufzeit.
declare class HTMLRewriter {
  on(
    selector: string,
    handlers: {
      element?(element: {
        setAttribute(name: string, value: string): void;
        setInnerContent(content: string): void;
      }): void;
    },
  ): HTMLRewriter;
  transform(response: Response): Response;
}
