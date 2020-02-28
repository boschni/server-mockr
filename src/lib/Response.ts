import {
  CookiesMap,
  CookiesMapObject,
  DelayAction,
  DelayConfig,
  HeadersMap,
  SetBodyAction,
  SetCookiesAction,
  SetHeadersAction,
  SetStatusAction
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
  private _cookies: CookiesMap = {};
  private _delay?: DelayConfig;
  private _headers: HeadersMap = {};
  private _status = 200;

  constructor(body?: unknown) {
    if (typeof body === "string") {
      this.body(body);
    } else if (typeof body !== "undefined") {
      this.json(body);
    }
  }

  status(code: number): this {
    this._status = code;
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
    this._status = 302;
    this._headers.Location = url;
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
    this._headers[name] = value;
    return this;
  }

  cookie(
    name: string,
    value: string,
    options?: CookiesMapObject["options"]
  ): this {
    this._cookies[name] = options ? { options, value } : value;
    return this;
  }

  async apply(ctx: ExpectationValue): Promise<ExpectationValue> {
    try {
      const setHeaders = new SetHeadersAction(this._headers);
      await setHeaders.execute(ctx);

      const setCookies = new SetCookiesAction(this._cookies);
      await setCookies.execute(ctx);

      const setBody = new SetBodyAction(this._body);
      await setBody.execute(ctx);

      const setStatus = new SetStatusAction(this._status);
      await setStatus.execute(ctx);

      if (this._delay) {
        const delayAction = new DelayAction(this._delay);
        await delayAction.execute(ctx);
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
