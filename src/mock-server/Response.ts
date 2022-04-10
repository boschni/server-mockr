import { ProxyRequest } from "./ProxyRequest";
import {
  CookiesMap,
  CookiesMapObject,
  DelayAction,
  DelayConfig,
  HeadersMap,
  ProxyAction,
  SetBodyAction,
  SetCookiesAction,
  SetHeadersAction,
  SetStatusAction,
  SetStatusTextAction,
} from "./respond-actions";
import { ExpectationValue } from "./Values";

/*
 * FACTORY
 */

export function response(body?: unknown) {
  return new Response(body);
}

/*
 * BUILDER
 */

export class Response {
  private _body?: string;
  private _cookies?: CookiesMap;
  private _delay?: DelayConfig;
  private _headers?: HeadersMap;
  private _proxy?: ProxyRequest;
  private _statusCode?: number;
  private _statusText?: string;

  constructor(body?: unknown) {
    if (typeof body === "string") {
      this.text(body);
    } else if (typeof body !== "undefined") {
      this.json(body);
    }
  }

  status(code: number): this {
    this._statusCode = code;
    return this;
  }

  statusText(text: string): this {
    this._statusText = text;
    return this;
  }

  delay(min: number, max: number): this;
  delay(min: number): this;
  delay(min: number, max?: number) {
    if (typeof max === "number") {
      this._delay = { min, max };
    } else {
      this._delay = { exact: min };
    }
    return this;
  }

  redirect(url: string): this {
    this._statusCode = 302;
    this.header("Location", url);
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

  json(json: unknown): this {
    this._body = JSON.stringify(json);
    this.header("Content-Type", "application/json");
    return this;
  }

  header(name: string, value: string): this {
    const headers = this._headers ?? {};
    const currentValue = headers[name];

    if (Array.isArray(currentValue)) {
      headers[name] = [...currentValue, value];
    } else if (typeof currentValue === "string") {
      headers[name] = [currentValue, value];
    } else {
      headers[name] = value;
    }

    this._headers = headers;

    return this;
  }

  cookie(
    name: string,
    value: string,
    options?: CookiesMapObject["options"]
  ): this {
    const cookies = this._cookies ?? {};
    cookies[name] = options ? { options, value } : value;
    this._cookies = cookies;
    return this;
  }

  proxy(url: string): this;
  proxy(proxyRequest: ProxyRequest): this;
  proxy(input: string | ProxyRequest): this {
    if (typeof input === "string") {
      this._proxy = new ProxyRequest(input);
    } else {
      this._proxy = input;
    }
    return this;
  }

  async _apply(ctx: ExpectationValue): Promise<ExpectationValue> {
    try {
      if (this._proxy) {
        const proxy = new ProxyAction(this._proxy);
        await proxy.execute(ctx);
      }

      if (this._headers) {
        const setHeaders = new SetHeadersAction(this._headers);
        await setHeaders.execute(ctx);
      }

      if (this._cookies) {
        const setCookies = new SetCookiesAction(this._cookies);
        await setCookies.execute(ctx);
      }

      if (this._body) {
        const setBody = new SetBodyAction(this._body);
        await setBody.execute(ctx);
      }

      if (this._statusCode) {
        const setStatus = new SetStatusAction(this._statusCode);
        await setStatus.execute(ctx);
      }

      if (this._statusText) {
        const setStatusText = new SetStatusTextAction(this._statusText);
        await setStatusText.execute(ctx);
      }

      if (this._delay) {
        const delayAction = new DelayAction(this._delay);
        await delayAction.execute();
      }
    } catch (err) {
      // tslint:disable-next-line: no-console
      console.error(err);
      ctx.res.status = 500;
      ctx.res.body = String(err);
    }

    return ctx;
  }
}
