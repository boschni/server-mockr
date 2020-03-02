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
  [name: string]: string;
}

/*
 * QUERY VALUE
 */

export interface QueryValue {
  [name: string]: string | string[];
}

/*
 * PARAMS VALUE
 */

export interface ParamsValue {
  [name: string]: string;
}

/*
 * REQUEST VALUE
 */

export interface RequestValue {
  body: RequestBodyValue;
  cookies: CookiesValue;
  headers: HeadersValue;
  method: MethodValue;
  params: ParamsValue;
  path: PathValue;
  query: QueryValue;
  url: UrlValue;
}

/*
 * OUTGOING REQUEST VALUE
 */

export interface OutgoingRequestValue {
  body?: string;
  cookies?: CookiesValue;
  headers?: HeadersValue;
  method?: MethodValue;
  path?: PathValue;
  query?: QueryValue;
  url: UrlValue;
}

/*
 * TIMES VALUE
 */

export type TimesValue = number;

/*
 * STATE VALUE
 */

export interface StateValue {
  [name: string]: any;
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
  statusText?: string;
}

/*
 * EXPECTATION VALUE
 */

export interface ExpectationValue {
  globals: GlobalsValue;
  req: RequestValue;
  res: ResponseValue;
  state: StateValue;
  times: TimesValue;
}

/*
 * JSON VALUE
 */

export type JSONValue =
  | null
  | undefined
  | boolean
  | number
  | string
  | JSONValue[]
  | { [prop: string]: JSONValue };

/*
 * SCHEMA
 */

export interface StateConfig {
  name: string;
  schema: JSONSchemaDefinition;
}

export type JSONSchemaDefinition =
  | JSONSchemaDefinitionString
  | JSONSChemaDefinitionNumber;

export interface JSONSchemaDefinitionString {
  type: "string";
  enum?: string[];
  default?: string;
  hidden?: boolean;
}

export interface JSONSChemaDefinitionNumber {
  type: "number";
  default?: string;
  hidden?: boolean;
}
