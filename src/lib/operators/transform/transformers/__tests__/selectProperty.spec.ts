import { selectProperty } from "../selectProperty";

describe("selectProperty()", () => {
  test("should return the property value if the property exists", () => {
    const input = { name: "John" };
    const select = selectProperty("name");
    const result = select(input);
    expect(result).toBe("John");
  });

  test("should return undefined if the property does not exist", () => {
    const input = {};
    const select = selectProperty("name");
    const result = select(input as any);
    expect(result).toBeUndefined();
  });
});
