import { appendValueToArrayValueMap } from "./valueHelpers";
import {
  CookiesValue,
  HeadersValue,
  MethodValue,
  OutgoingRequestValue,
  PathValue,
  QueryValue,
  UrlValue,
} from "./Values";

/*
 * FACTORY
 */

export function outgoingRequest(url?: string) {
  return new OutgoingRequestBuilder(url);
}

/*
 * BUILDER
 */

export class OutgoingRequestBuilder {
  private _body?: string;
  private _cookies?: CookiesValue;
  private _headers?: HeadersValue;
  private _method?: MethodValue;
  private _path?: PathValue;
  private _query?: QueryValue;
  private _url: UrlValue = "";

  constructor(url?: string) {
    if (typeof url === "string") {
      this.url(url);
    }
  }

  method(method: MethodValue): this {
    this._method = method;
    return this;
  }

  get(url: string): this {
    this.method("GET");
    this.url(url);
    return this;
  }

  post(url: string): this {
    this.method("POST");
    this.url(url);
    return this;
  }

  put(url: string): this {
    this.method("PUT");
    this.url(url);
    return this;
  }

  delete(url: string): this {
    this.method("DELETE");
    this.url(url);
    return this;
  }

  url(url: string): this {
    this._url = url;
    return this;
  }

  path(path: string): this {
    this._path = path;
    return this;
  }

  query(name: string, value: string | string[]): this {
    const query = this._query ?? {};
    this._query = appendValueToArrayValueMap(query, name, value) as QueryValue;
    return this;
  }

  cookie(name: string, value: string): this {
    const cookies = this._cookies ?? {};
    cookies[name] = value;
    this._cookies = cookies;
    return this;
  }

  header(name: string, value: string | string[]): this {
    const headers = this._headers ?? {};
    this._headers = appendValueToArrayValueMap(headers, name, value);
    return this;
  }

  body(body: string): this {
    this._body = body;
    return this;
  }

  text(body: string): this {
    this._body = body;
    this.header("Content-Type", "text/plain");
    return this;
  }

  json(value: unknown): this {
    this._body = JSON.stringify(value);
    this.header("Content-Type", "application/json");
    return this;
  }

  _build(): OutgoingRequestValue {
    return {
      body: this._body,
      cookies: this._cookies,
      headers: this._headers,
      method: this._method,
      path: this._path,
      query: this._query,
      url: this._url,
    };
  }
}
