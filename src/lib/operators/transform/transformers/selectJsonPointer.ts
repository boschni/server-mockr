import { get } from "json-pointer";

export const selectJsonPointer = (pointer: string) => (input: any): unknown =>
  typeof input === "object" ? get(input, pointer) : undefined;
