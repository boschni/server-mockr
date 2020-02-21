import { ExpectationValue } from "../Values";
import { DelayAction } from "./Delay";
import { ResponseAction } from "./ResponseAction";
import { SetBodyAction } from "./SetBody";
import { CookiesMap, SetCookiesAction } from "./SetCookies";
import { HeadersMap, SetHeadersAction } from "./SetHeaders";
import { SetStatusAction } from "./SetStatus";

/*
 * ACTION
 */

export interface ResponseConfig {
  body?: string;
  cookies: CookiesMap;
  delay?: number;
  headers: HeadersMap;
  status?: number;
}

/*
 * ACTION
 */

export class RespondAction implements ResponseAction {
  private _config: ResponseConfig;

  constructor(config: ResponseConfig) {
    this._config = config;
  }

  async execute(ctx: ExpectationValue): Promise<void> {
    const { body, cookies, delay, headers, status } = this._config;

    try {
      const setHeaders = new SetHeadersAction(headers);
      await setHeaders.execute(ctx);

      const setCookies = new SetCookiesAction(cookies);
      await setCookies.execute(ctx);

      const setBody = new SetBodyAction(body);
      await setBody.execute(ctx);

      const setStatus = new SetStatusAction(status);
      await setStatus.execute(ctx);

      if (delay) {
        const delayAction = new DelayAction(delay);
        await delayAction.execute(ctx);
      }
    } catch (err) {
      // tslint:disable-next-line: no-console
      console.error(err);
      ctx.res.status = 500;
      ctx.res.body = String(err);
    }
  }
}
