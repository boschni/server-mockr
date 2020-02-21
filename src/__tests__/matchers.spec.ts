import "jest";

import {
  endsWith,
  isGreaterThan,
  isGreaterThanOrEqual,
  isLowerThan,
  isLowerThanOrEqual,
  matchesObject,
  pointer,
  prop,
  request,
  ServerMockr,
  startsWith
} from "../";
import { get, post, setup } from "./utils";

describe("matchers", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * startsWith()
   */

  describe("startsWith()", () => {
    test("should match when the input matches the prefix", async () => {
      mockr.when(request().path(startsWith("/t"))).respond("ok");
      const res = await get("/test");
      expect(res.text).toEqual("ok");
    });

    test("should not match when the input does not match the prefix", async () => {
      mockr.when(request().path(startsWith("/a"))).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * endsWith()
   */

  describe("endsWith()", () => {
    test("should match when the input matches the suffix", async () => {
      mockr.when(request().path(endsWith("st"))).respond("ok");
      const res = await get("/test");
      expect(res.text).toEqual("ok");
    });

    test("should not match when the input does not match the suffix", async () => {
      mockr.when(request().path(endsWith("a"))).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * isGreaterThan()
   */

  describe("isGreaterThan()", () => {
    test("should match when the input is greater", async () => {
      mockr.when(request().body(prop("a", isGreaterThan(1)))).respond("ok");
      const res = await post("/test").send({ a: 2 });
      expect(res.text).toEqual("ok");
    });

    test("should not match when the input is equal", async () => {
      mockr.when(request().body(prop("a", isGreaterThan(1)))).respond("ok");
      const res = await post("/test").send({ a: 1 });
      expect(res.status).toEqual(404);
    });

    test("should not match when the input is lower", async () => {
      mockr.when(request().body(prop("a", isGreaterThan(1)))).respond("ok");
      const res = await post("/test").send({ a: 0 });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * isGreaterThanOrEqual()
   */

  describe("isGreaterThanOrEqual()", () => {
    test("should match when the input is greater", async () => {
      mockr
        .when(request().body(prop("a", isGreaterThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test").send({ a: 3 });
      expect(res.text).toEqual("ok");
    });

    test("should match when the input is equal", async () => {
      mockr
        .when(request().body(prop("a", isGreaterThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test").send({ a: 2 });
      expect(res.text).toEqual("ok");
    });

    test("should not match when the input is lower", async () => {
      mockr
        .when(request().body(prop("a", isGreaterThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test").send({ a: 1 });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * isLowerThan()
   */

  describe("isLowerThan()", () => {
    test("should match when the input is lower", async () => {
      mockr.when(request().body(prop("a", isLowerThan(2)))).respond("ok");
      const res = await post("/test").send({ a: 1 });
      expect(res.text).toEqual("ok");
    });

    test("should not match when the input is equal", async () => {
      mockr.when(request().body(prop("a", isLowerThan(2)))).respond("ok");
      const res = await post("/test").send({ a: 2 });
      expect(res.status).toEqual(404);
    });

    test("should not match when the input is greater", async () => {
      mockr.when(request().body(prop("a", isLowerThan(2)))).respond("ok");
      const res = await post("/test").send({ a: 3 });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * isLowerThanOrEqual()
   */

  describe("isLowerThanOrEqual()", () => {
    test("should match when the input is lower", async () => {
      mockr
        .when(request().body(prop("a", isLowerThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test").send({ a: 1 });
      expect(res.text).toEqual("ok");
    });

    test("should match when the input is equal", async () => {
      mockr
        .when(request().body(prop("a", isLowerThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test").send({ a: 2 });
      expect(res.text).toEqual("ok");
    });

    test("should not match when the input is greater", async () => {
      mockr
        .when(request().body(prop("a", isLowerThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test").send({ a: 3 });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * prop()
   */

  describe("prop()", () => {
    test("should match when property value is equal", async () => {
      mockr.when(request().body(prop("a", "b"))).respond("ok");
      const res = await post("/test").send({ a: "b" });
      expect(res.text).toEqual("ok");
    });

    test("should match when property value matches a match function", async () => {
      mockr.when(request().body(prop("a", startsWith("b")))).respond("ok");
      const res = await post("/test").send({ a: "b" });
      expect(res.text).toEqual("ok");
    });

    test("should not match when property value is not equal", async () => {
      mockr.when(request().body(prop("a", "b"))).respond("ok");
      const res = await post("/test").send({ a: "c" });
      expect(res.status).toEqual(404);
    });

    test("should not match when property path does not exist", async () => {
      mockr.when(request().body(prop("a", "c"))).respond("ok");
      const res = await post("/test").send({ b: "c" });
      expect(res.status).toEqual(404);
    });

    test("should not match when there is no body", async () => {
      mockr.when(request().body(prop("a", "c"))).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * pointer()
   */

  describe("pointer()", () => {
    test("should match when pointer value is equal", async () => {
      mockr.when(request().body(pointer("/a/1", "b"))).respond("ok");
      const res = await post("/test").send({ a: ["a", "b"] });
      expect(res.text).toEqual("ok");
    });

    test("should match when pointer value matches a match function", async () => {
      mockr
        .when(request().body(pointer("/a/1", startsWith("b"))))
        .respond("ok");
      const res = await post("/test").send({ a: ["a", "b"] });
      expect(res.text).toEqual("ok");
    });

    test("should not match when pointer value is not equal", async () => {
      mockr.when(request().body(pointer("/a/1", "c"))).respond("ok");
      const res = await post("/test").send({ a: ["a", "b"] });
      expect(res.status).toEqual(404);
    });

    test("should not match when pointer path does not exist", async () => {
      mockr.when(request().body(pointer("/invalid/a/b", "c"))).respond("ok");
      const res = await post("/test").send({ a: ["a", "b"] });
      expect(res.status).toEqual(404);
    });

    test("should not match when there is no body", async () => {
      mockr.when(request().body(pointer("/invalid/a/b", "c"))).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * matchesObject()
   */

  describe("matchesObject()", () => {
    test("should match when the object partially matches", async () => {
      mockr
        .when(request().body(matchesObject({ a: "b", b: [1] })))
        .respond("ok");
      const res = await post("/test").send({ a: "b", b: [1], c: "d" });
      expect(res.text).toEqual("ok");
    });

    test("should not match when the object does not match partially", async () => {
      mockr.when(request().body(matchesObject({ a: "b" }))).respond("ok");
      const res = await post("/test").send({ b: "b" });
      expect(res.status).toEqual(404);
    });
  });
});
