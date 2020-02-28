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

  status(code: number): this {
    this._config.status = code;
    return this;
  }

  delay(min: number, max: number): this;
  delay(min: number): this;
  delay(min: number, max?: number) {
    if (typeof max === "number") {
      this._config.delay = { min, max };
    } else {
      this._config.delay = { exact: min };
    }
    return this;
  }

  redirect(url: string): this {
    this._config.status = 302;
    this._config.headers.Location = url;
    return this;
  }

  body(body: string): this {
    this._config.body = body;
    return this;
  }

  text(body: string): this {
    this._config.body = body;
    this.header("Content-Type", "text/plain");
    return this;
  }

  json(json: unknown): this {
    this._config.body = JSON.stringify(json);
    this.header("Content-Type", "application/json");
    return this;
  }

  header(name: string, value: string): this {
    this._config.headers[name] = value;
    return this;
  }

  cookie(
    name: string,
    value: string,
    options?: CookiesMapObject["options"]
  ): this {
    this._config.cookies[name] = options ? { options, value } : value;
    return this;
  }

  getConfig() {
    return this._config;
  }
}
