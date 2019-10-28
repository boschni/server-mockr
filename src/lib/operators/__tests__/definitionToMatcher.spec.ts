import { definitionToMatcher } from "../adapters";

describe("definitionToMatcher()", () => {
  test("should validate on valid input", () => {
    const validator = definitionToMatcher({
      startsWith: "V"
    })!;
    const result = validator("Valid");
    expect(result).toMatchObject({ pass: true });
  });

  test("should validate on valid input", () => {
    const validator = definitionToMatcher({
      json: {
        pipe: [
          {
            selectProperty: "name"
          },
          {
            startsWith: "J"
          }
        ]
      }
    })!;
    const result = validator(`{ "name": "John" }`);
    expect(result).toMatchObject({ pass: true });
  });
});
