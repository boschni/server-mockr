import { BehaviourFunction } from "../behaviour";

export const delay = (ms: number): BehaviourFunction => async () =>
  new Promise(resolve => setTimeout(resolve, ms));
