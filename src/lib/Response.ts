import { ResponseConfig } from "./response-actions/Respond";
import { CookiesMapObject } from "./response-actions/SetCookies";

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
  private _config: ResponseConfig = {
    cookies: {},
    headers: {},
    status: 200
  };

  constructor(body?: unknown) {
    if (typeof body === "string") {
      this.body(body);
    } else if (typeof body !== "undefined") {
      this.json(body);
    }
  }

  status(code: number) {
    this._config.status = code;
    return this;
  }

  delay(ms: number) {
    this._config.delay = ms;
    return this;
  }

  redirect(url: string) {
    this._config.status = 302;
    this._config.headers.Location = url;
    return this;
  }

  body(body: string) {
    this._config.body = body;
    this.header("Content-Type", "text/plain");
    return this;
  }

  json(json: unknown) {
    this._config.body = JSON.stringify(json);
    this.header("Content-Type", "application/json");
    return this;
  }

  header(name: string, value: string) {
    this._config.headers[name] = value;
    return this;
  }

  cookie(name: string, value: string, options?: CookiesMapObject["options"]) {
    this._config.cookies[name] = options ? { options, value } : value;
    return this;
  }

  getConfig() {
    return this._config;
  }
}
