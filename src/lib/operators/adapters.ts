import {
  allOf,
  endsWith,
  equalTo,
  greaterThan,
  greaterThanOrEqual,
  json,
  lowerThan,
  lowerThanOrEqual,
  matchObject,
  not,
  oneOf,
  regex,
  startsWith
} from "./match/matchers";
import { MatchFn } from "./match/MatchOperator";
import {
  pipe,
  selectJsonPointer,
  selectProperty
} from "./transform/transformers";
import { TransformFn } from "./transform/TransformOperator";

/*
 * MATCHERS
 */

const allOfAdapter = (defs: MatchOperatorDefinition[]) => {
  const matchers = defs
    .map(def => definitionToMatcher(def))
    .filter(fn => fn) as MatchFn[];
  return allOf(...matchers);
};

const oneOfAdapter = (defs: MatchOperatorDefinition[]) => {
  const matchers = defs
    .map(def => definitionToMatcher(def))
    .filter(fn => fn) as MatchFn[];
  return oneOf(...matchers);
};

const jsonAdapter = (def: MatchOperatorDefinition) => {
  const matcher = definitionToMatcher(def);
  return matcher ? json(matcher) : undefined;
};

const notAdapter = (def: MatchOperatorDefinition) => {
  const matcher = definitionToMatcher(def);
  return matcher ? not(matcher) : undefined;
};

const matchPipeAdapter = (
  defs: Array<MatchOperatorDefinition | TransformOperatorDefinition>
): any => {
  const fns = defs
    .map(def => definitionToMatcher(def) || definitionToTransformer(def))
    .filter(fn => fn);
  return (pipe as any)(...fns);
};

export interface MatchOperatorDefinition {
  allOf?: Parameters<typeof allOfAdapter>[0];
  endsWith?: Parameters<typeof endsWith>[0];
  equalTo?: Parameters<typeof equalTo>[0];
  greaterThan?: Parameters<typeof greaterThan>[0];
  greaterThanOrEqual?: Parameters<typeof greaterThanOrEqual>[0];
  json?: Parameters<typeof jsonAdapter>[0];
  lowerThan?: Parameters<typeof lowerThan>[0];
  lowerThanOrEqual?: Parameters<typeof lowerThanOrEqual>[0];
  matchObject?: Parameters<typeof matchObject>[0];
  not?: Parameters<typeof notAdapter>[0];
  oneOf?: Parameters<typeof oneOf>[0];
  pipe?: Parameters<typeof matchPipeAdapter>[0];
  regex?: Parameters<typeof regex>[0];
  startsWith?: Parameters<typeof startsWith>[0];
}

const matchAdapters = {
  allOf: allOfAdapter,
  endsWith,
  equalTo,
  greaterThan,
  greaterThanOrEqual,
  json: jsonAdapter,
  lowerThan,
  lowerThanOrEqual,
  matchObject,
  not: notAdapter,
  oneOf: oneOfAdapter,
  pipe: matchPipeAdapter,
  regex,
  startsWith
};

export const definitionToMatcher = (
  def: MatchOperatorDefinition
): MatchFn | undefined => {
  const names = Object.keys(def) as Array<keyof typeof matchAdapters>;

  if (names.length === 1) {
    const name = names[0];
    const adapter = matchAdapters[name];

    if (!adapter) {
      return;
    }

    return adapter(def[name]);
  }

  if (names.length > 1) {
    const defs = names.map<MatchOperatorDefinition>(name => ({
      [name]: def[name]
    }));
    return allOfAdapter(defs);
  }
};

/*
 * TRANSFORMERS
 */

const transformPipeAdapter = (defs: TransformOperatorDefinition[]) => {
  const fns = defs.map(def => definitionToTransformer(def)).filter(fn => fn);
  return (pipe as any)(...fns);
};

export interface TransformOperatorDefinition {
  pipe?: Parameters<typeof transformPipeAdapter>[0];
  selectJsonPointer?: Parameters<typeof selectJsonPointer>[0];
  selectProperty?: Parameters<typeof selectProperty>[0];
}

const transformAdapters = {
  pipe: transformPipeAdapter,
  selectJsonPointer,
  selectProperty
};

export const definitionToTransformer = (
  def: TransformOperatorDefinition
): TransformFn | undefined => {
  const names = Object.keys(def) as Array<keyof typeof transformAdapters>;
  const name = names[0];

  if (name) {
    const adapter = transformAdapters[name];

    if (!adapter) {
      return;
    }

    return adapter(def[name] as any);
  }
};
