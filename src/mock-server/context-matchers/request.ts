import {
  isEqualTo,
  isMatchRequestMatchResult,
  matchesPath,
  MatchesPathInput,
  matchesRequest,
  MatchFn,
  MatchResult,
  prop,
  RequestMatchDef,
} from "../value-matchers";
import { ExpectationValue, FileValue, JSONValue, MethodValue } from "../Values";
import { ContextMatcher } from "./ContextMatcher";

/*
 * FACTORY
 */

export function request(path?: MatchesPathInput): RequestMatcher;
export function request(fn?: MatchFn): RequestMatcher;
export function request(matcher?: MatchesPathInput | MatchFn): RequestMatcher {
  return new RequestMatcher(matcher as MatchFn);
}

/*
 * BUILDER
 */

export class RequestMatcher implements ContextMatcher {
  private _bodyMatchers: MatchFn[] = [];
  private _cookiesMatchers: MatchFn[] = [];
  private _filesMatchers: MatchFn[] = [];
  private _headersMatchers: MatchFn[] = [];
  private _methodMatchers: MatchFn[] = [];
  private _paramsMatchers: MatchFn[] = [];
  private _pathMatchers: MatchFn[] = [];
  private _queryMatchers: MatchFn[] = [];
  private _urlMatchers: MatchFn[] = [];

  constructor(path?: MatchesPathInput);
  constructor(fn?: MatchFn);
  constructor(matcher?: MatchesPathInput | MatchFn) {
    if (matcher) {
      this.path(matcher as MatchFn);
    }
  }

  method(method: MethodValue): RequestMatcher;
  method(fn: MatchFn): RequestMatcher;
  method(matcher: MethodValue | MatchFn): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._methodMatchers.push(matcher);
    return this;
  }

  path(path: MatchesPathInput): RequestMatcher;
  path(fn: MatchFn): RequestMatcher;
  path(matcher: MatchesPathInput | MatchFn): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : matchesPath(matcher);
    this._pathMatchers.push(matcher);
    return this;
  }

  get(path: MatchesPathInput): RequestMatcher;
  get(fn: MatchFn): RequestMatcher;
  get(matcher: MatchesPathInput | MatchFn): RequestMatcher {
    this.method("GET");
    this.path(matcher as MatchFn);
    return this;
  }

  post(path: MatchesPathInput): RequestMatcher;
  post(fn: MatchFn): RequestMatcher;
  post(matcher: MatchesPathInput | MatchFn): RequestMatcher {
    this.method("POST");
    this.path(matcher as MatchFn);
    return this;
  }

  put(path: MatchesPathInput): RequestMatcher;
  put(fn: MatchFn): RequestMatcher;
  put(matcher: MatchesPathInput | MatchFn): RequestMatcher {
    this.method("PUT");
    this.path(matcher as MatchFn);
    return this;
  }

  delete(path: MatchesPathInput): RequestMatcher;
  delete(fn: MatchFn): RequestMatcher;
  delete(matcher: MatchesPathInput | MatchFn): RequestMatcher {
    this.method("DELETE");
    this.path(matcher as MatchFn);
    return this;
  }

  url(url: string): RequestMatcher;
  url(fn: MatchFn): RequestMatcher;
  url(matcher: string | MatchFn): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._urlMatchers.push(matcher);
    return this;
  }

  query(name: string, value: string | string[]): RequestMatcher;
  query(name: string, fn: MatchFn): RequestMatcher;
  query(name: string, matcher: string | string[] | MatchFn): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._queryMatchers.push(prop(name, matcher));
    return this;
  }

  param(name: string, value: string): RequestMatcher;
  param(name: string, fn: MatchFn): RequestMatcher;
  param(name: string, matcher: string | MatchFn): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._paramsMatchers.push(prop(name, matcher));
    return this;
  }

  cookie(name: string, value: string): RequestMatcher;
  cookie(name: string, fn: MatchFn): RequestMatcher;
  cookie(name: string, matcher: string | MatchFn): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._cookiesMatchers.push(prop(name, matcher));
    return this;
  }

  header(name: string, value: string | string[]): RequestMatcher;
  header(name: string, fn: MatchFn): RequestMatcher;
  header(name: string, matcher: string | string[] | MatchFn): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._headersMatchers.push(prop(name.toLowerCase(), matcher));
    return this;
  }

  file(
    name: string,
    value: Partial<FileValue> | Partial<FileValue>[]
  ): RequestMatcher;
  file(name: string, fn: MatchFn): RequestMatcher;
  file(
    name: string,
    matcher: Partial<FileValue> | Partial<FileValue>[] | MatchFn
  ): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._filesMatchers.push(prop(name, matcher));
    return this;
  }

  body(value: JSONValue): RequestMatcher;
  body(fn: MatchFn): RequestMatcher;
  body(matcher: JSONValue | MatchFn): RequestMatcher {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._bodyMatchers.push(matcher as MatchFn);
    return this;
  }

  match(ctx: ExpectationValue): MatchResult {
    ctx.req.params = {};

    const def: RequestMatchDef = {
      body: this._bodyMatchers,
      cookies: this._cookiesMatchers,
      files: this._filesMatchers,
      headers: this._headersMatchers,
      method: this._methodMatchers,
      params: this._paramsMatchers,
      path: this._pathMatchers,
      query: this._queryMatchers,
      url: this._urlMatchers,
    };

    const matcher = matchesRequest(def);
    const result = matcher(ctx.req);

    if (isMatchRequestMatchResult(result)) {
      ctx.req.params = result.params;
    }

    return result;
  }
}
