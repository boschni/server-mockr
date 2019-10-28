/*
 * URL VALUE
 */

export type UrlValue = string;

/*
 * PATH VALUE
 */

export type PathValue = string;

/*
 * METHOD VALUE
 */

export type MethodValue =
  | "CONNECT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT"
  | "TRACE";

/*
 * REQUEST BODY VALUE
 */

export type RequestBodyValue = any;

/*
 * RESPONSE BODY VALUE
 */

export type ResponseBodyValue = string;

/*
 * HEADERS VALUE
 */

export interface HeadersValue {
  [name: string]: string | string[] | undefined;
}

/*
 * COOKIES VALUE
 */

export interface CookiesValue {
  [name: string]: string | string[];
}

/*
 * QUERY  VALUE
 */

export interface QueryValue {
  [name: string]: string | string[];
}

/*
 * REQUEST VALUE
 */

export interface RequestValue {
  body: RequestBodyValue;
  cookies: CookiesValue;
  headers: HeadersValue;
  method: MethodValue;
  path: PathValue;
  query: QueryValue;
  url: UrlValue;
}

/*
 * TIMES VALUE
 */

export type TimesValue = number;

/*
 * CONFIG VALUE
 */

export interface ConfigValue {
  [name: string]: string | undefined;
}

/*
 * STATE VALUE
 */

export interface StateValue {
  [name: string]: string | undefined;
}

/*
 * GLOBALS VALUE
 */

export interface GlobalsValue {
  [name: string]: any;
}

/*
 * RESPONSE VALUE
 */

export interface ResponseValue {
  body?: ResponseBodyValue;
  headers: HeadersValue;
  status?: number;
}

/*
 * EXPECTATION VALUE
 */

export interface ExpectationValue {
  config: ConfigValue;
  globals: GlobalsValue;
  request: RequestValue;
  response: ResponseValue;
  state: StateValue;
  times: TimesValue;
}
