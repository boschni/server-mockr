import {
  ExpectationDefinition,
  ExpectationResponseDefinition
} from "./ExpectationDefinition";
import { ConfigValue, StateValue } from "./Values";

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
  config: ConfigValue,
  state: StateValue
) => ExpectationDefinition[];

export type ExpectationsDefinition =
  | ExpectationDefinition[]
  | ExpectationsFactory;
