import { get, has } from "json-pointer";

export const selectJsonPointer = (pointer: string) => (input: any): unknown => {
  if (typeof input === "object" && has(input, pointer)) {
    return get(input, pointer);
  }
};
