import { startsWith } from "../startsWith";

describe("startsWith()", () => {
  test("should validate on valid input", () => {
    const validator = startsWith("V");
    const result = validator("Valid");
    expect(result).toMatchObject({ name: "startsWith", pass: true });
  });

  test("should not validate on invalid input", () => {
    const validator = startsWith("V");
    const result = validator("Invalid");
    expect(result).toMatchObject({
      message: `start with "V"`,
      name: "startsWith",
      pass: false
    });
  });
});
