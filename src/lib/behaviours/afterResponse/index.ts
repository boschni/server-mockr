import { BehaviourFactoryMap } from "../behaviour";
import { setState } from "./setState";

export interface AfterResponseBehaviourDefinition {
  setState?: Parameters<typeof setState>[0];
}

export const afterResponseBehaviourMap: BehaviourFactoryMap = {
  setState
};

export const afterResponseBehaviourOrder: Array<
  keyof AfterResponseBehaviourDefinition
> = ["setState"];
