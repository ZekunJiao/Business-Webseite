// Minimale Typen für das Cloudflare-Laufzeitmodul "cloudflare:email".
declare module "cloudflare:email" {
  export class EmailMessage {
    constructor(from: string, to: string, raw: string);
    readonly from: string;
    readonly to: string;
  }
}
