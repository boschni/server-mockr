export const selectProperty = <P extends string>(name: P) => <
  T extends { [K in P]: T[K] }
>(
  input: T
): T[P] | undefined => {
  const inputAsUnknown = input as any;
  switch (typeof inputAsUnknown) {
    case "object":
      return inputAsUnknown[name];
    default:
      return;
  }
};
