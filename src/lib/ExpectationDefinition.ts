import { AfterResponseBehaviourDefinition } from "./behaviours/afterResponse";
import { ResponseBehaviourDefinition } from "./behaviours/response";
import { MatchOperatorDefinition } from "./operators/adapters";
import { MatchResult } from "./operators/match/MatchOperator";
import { ConfigValue, GlobalsValue, RequestValue, StateValue } from "./Values";

/*
 * EXPECTATION DEFINITION
 */

export interface ExpectationDefinition {
  afterResponse?: ExpectationAfterResponseDefinition;
  id?: string;
  match: ExpectationMatchDefinition;
  response: ExpectationResponseDefinition;
  verify?: ExpectationVerifyDefinition;
}

/*
 * EXPECTATION MATCH DEFINITION
 */

export interface ExpectationMatchDefinition {
  config?: ExpectationMatchConfigDefinition;
  globals?: ExpectationMatchGlobalsDefinition;
  request?: ExpectationMatchRequestDefinition;
  state?: ExpectationMatchStateDefinition;
  times?: ExpectationMatchTimesDefinition;
}

export type ExpectationMatchConfigDefinition =
  | MatchOperatorDefinition
  | ExpectationMatchConfigFunction;
export type ExpectationMatchConfigFunction = (
  config: ConfigValue
) => MatchResult;

export type ExpectationMatchGlobalsDefinition =
  | MatchOperatorDefinition
  | ExpectationMatchGlobalsFunction;
export type ExpectationMatchGlobalsFunction = (
  globals: GlobalsValue
) => MatchResult;

export type ExpectationMatchRequestDefinition =
  | ExpectationRequestDefinition
  | ExpectationMatchRequestFunction;
export type ExpectationMatchRequestFunction = (
  request: RequestValue
) => MatchResult;

export type ExpectationMatchStateDefinition =
  | MatchOperatorDefinition
  | ExpectationMatchStateFunction;
export type ExpectationMatchStateFunction = (state: StateValue) => MatchResult;

export type ExpectationMatchTimesDefinition =
  | MatchOperatorDefinition
  | ExpectationMatchTimesFunction;
export type ExpectationMatchTimesFunction = (times: number) => MatchResult;

/*
 * EXPECTATION VERIFY DEFINITION
 */

export interface ExpectationVerifyDefinition
  extends ExpectationMatchDefinition {}

/*
 * EXPECTATION REQUEST DEFINITION
 */

export interface ExpectationRequestDefinition {
  body?: ExpectationBodyDefinition;
  cookies?: ExpectationCookiesDefinition;
  headers?: ExpectationHeadersDefinition;
  method?: ExpectationMethodDefinition;
  path?: ExpectationPathDefinition;
  query?: ExpectationQueryDefinition;
  url?: ExpectationUrlDefinition;
}

export type ExpectationBodyDefinition = MatchOperatorDefinition;
export type ExpectationCookiesDefinition = MatchOperatorDefinition;
export type ExpectationHeadersDefinition = MatchOperatorDefinition;
export type ExpectationMethodDefinition = MatchOperatorDefinition;
export type ExpectationPathDefinition = MatchOperatorDefinition;
export type ExpectationQueryDefinition = MatchOperatorDefinition;
export type ExpectationUrlDefinition = MatchOperatorDefinition;

/*
 * EXPECTATION RESPONSE DEFINITION
 */

export type ExpectationResponseDefinition =
  | ExpectationResponseFunction
  | ResponseBehaviourDefinition;

export type ExpectationResponseFunction = (
  context: ExpectationResponseFunctionContext
) => ResponseBehaviourDefinition;

export interface ExpectationResponseFunctionContext {
  request: RequestValue;
  config: ConfigValue;
  state: StateValue;
}

/*
 * EXPECTATION AFTER RESPONSE DEFINITION
 */

export type ExpectationAfterResponseDefinition =
  | ExpectationAfterResponseFunction
  | AfterResponseBehaviourDefinition;

export type ExpectationAfterResponseFunction = (
  context: ExpectationAfterResponseFunctionContext
) => AfterResponseBehaviourDefinition;

export interface ExpectationAfterResponseFunctionContext {
  request: RequestValue;
  config: ConfigValue;
  state: StateValue;
}
