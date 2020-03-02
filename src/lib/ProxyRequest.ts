import { OutgoingRequestBuilder } from "./OutgoingRequestBuilder";

/*
 * FACTORY
 */

export function proxyRequest(url: string): ProxyRequest {
  return new ProxyRequest(url);
}

/*
 * BUILDER
 */

export class ProxyRequest extends OutgoingRequestBuilder {}
