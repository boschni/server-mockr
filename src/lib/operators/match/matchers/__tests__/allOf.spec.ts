import { allOf } from "../allOf";
import { endsWith } from "../endsWith";
import { startsWith } from "../startsWith";

describe("allOf()", () => {
  test("should validate on valid input", () => {
    const validator = allOf(startsWith("V"), endsWith("d"));
    const result = validator("Valid");
    expect(result).toMatchObject({ pass: true });
  });

  test("should not validate on invalid input", () => {
    const validator = allOf(startsWith("V"), endsWith("d"));
    const result = validator("Invalid");
    expect(result).toMatchObject({
      message: `start with "V"`,
      pass: false
    });
  });
});
