import {
  ExpectationDefinition,
  ExpectationResponseDefinition
} from "./ExpectationDefinition";
import { ConfigValue, GlobalsValue, StateValue } from "./Values";

export interface ScenarioDefinition {
  config?: ConfigDefinition;
  description?: string;
  expectations: ExpectationsDefinition;
  id: string;
  onStart?: ScenarioOnStartDefinition;
  state?: StateDefinition;
  tags?: string[];
}

export interface ScenarioOnStartDefinition {
  response?: ExpectationResponseDefinition;
}

export interface ConfigDefinition {
  [key: string]: JSONSchemaDefinition;
}

export interface StateDefinition {
  [key: string]: JSONSchemaDefinition;
}

export type JSONSchemaDefinition =
  | JSONSchemaDefinitionString
  | JSONSChemaDefinitionNumber;

export interface JSONSchemaDefinitionString {
  type: "string";
  enum?: string[];
  default?: string;
}

export interface JSONSChemaDefinitionNumber {
  type: "number";
  default?: string;
}

export type ExpectationsFactory = (
  context: ExpectationsFactoryContext
) => ExpectationDefinition[];

export interface ExpectationsFactoryContext {
  config: ConfigValue;
  globals: GlobalsValue;
  state: StateValue;
}

export type ExpectationsDefinition =
  | ExpectationDefinition[]
  | ExpectationsFactory;
