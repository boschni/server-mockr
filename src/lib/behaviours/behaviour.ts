import { ExpectationValue } from "../Values";

export type BehaviourFactory = (config: any) => BehaviourFunction;

export type BehaviourFunction = (ctx: ExpectationValue) => Promise<void>;

export interface BehaviourFactoryMap {
  [name: string]: BehaviourFactory | undefined;
}

export const applyBehaviours = async (
  behaviourMap: BehaviourFactoryMap,
  behaviourOrder: string[],
  ctx: ExpectationValue,
  def: any
) => {
  const resolvedDef = typeof def === "function" ? def(ctx) : def;

  if (!resolvedDef) {
    // tslint:disable-next-line: no-console
    console.warn("server-mockr: No behaviour definitions found");
    return;
  }

  for (const name of behaviourOrder) {
    const behaviourDef = resolvedDef[name];
    if (!behaviourDef) {
      continue;
    }

    const behaviour = behaviourMap[name];
    if (!behaviour) {
      // tslint:disable-next-line: no-console
      console.warn(`server-mockr: No behaviour with name ${name} found`);
      continue;
    }

    const behaviourFn = behaviour(behaviourDef);
    await behaviourFn(ctx);
  }
};
