import "jest";

import {
  endsWith,
  isGreaterThan,
  isGreaterThanOrEqual,
  isLowerThan,
  isLowerThanOrEqual,
  matchesObject,
  oneOf,
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
      expect(await res.text()).toEqual("ok");
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
      expect(await res.text()).toEqual("ok");
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
      const res = await post("/test", { a: 2 });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when the input is equal", async () => {
      mockr.when(request().body(prop("a", isGreaterThan(1)))).respond("ok");
      const res = await post("/test", { a: 1 });
      expect(res.status).toEqual(404);
    });

    test("should not match when the input is lower", async () => {
      mockr.when(request().body(prop("a", isGreaterThan(1)))).respond("ok");
      const res = await post("/test", { a: 0 });
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
      const res = await post("/test", { a: 3 });
      expect(await res.text()).toEqual("ok");
    });

    test("should match when the input is equal", async () => {
      mockr
        .when(request().body(prop("a", isGreaterThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test", { a: 2 });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when the input is lower", async () => {
      mockr
        .when(request().body(prop("a", isGreaterThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test", { a: 1 });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * isLowerThan()
   */

  describe("isLowerThan()", () => {
    test("should match when the input is lower", async () => {
      mockr.when(request().body(prop("a", isLowerThan(2)))).respond("ok");
      const res = await post("/test", { a: 1 });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when the input is equal", async () => {
      mockr.when(request().body(prop("a", isLowerThan(2)))).respond("ok");
      const res = await post("/test", { a: 2 });
      expect(res.status).toEqual(404);
    });

    test("should not match when the input is greater", async () => {
      mockr.when(request().body(prop("a", isLowerThan(2)))).respond("ok");
      const res = await post("/test", { a: 3 });
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
      const res = await post("/test", { a: 1 });
      expect(await res.text()).toEqual("ok");
    });

    test("should match when the input is equal", async () => {
      mockr
        .when(request().body(prop("a", isLowerThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test", { a: 2 });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when the input is greater", async () => {
      mockr
        .when(request().body(prop("a", isLowerThanOrEqual(2))))
        .respond("ok");
      const res = await post("/test", { a: 3 });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * prop()
   */

  describe("prop()", () => {
    test("should match when property value is equal", async () => {
      mockr.when(request().body(prop("a", "b"))).respond("ok");
      const res = await post("/test", { a: "b" });
      expect(await res.text()).toEqual("ok");
    });

    test("should match when property value matches a match function", async () => {
      mockr.when(request().body(prop("a", startsWith("b")))).respond("ok");
      const res = await post("/test", { a: "b" });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when property value is not equal", async () => {
      mockr.when(request().body(prop("a", "b"))).respond("ok");
      const res = await post("/test", { a: "c" });
      expect(res.status).toEqual(404);
    });

    test("should not match when property path does not exist", async () => {
      mockr.when(request().body(prop("a", "c"))).respond("ok");
      const res = await post("/test", { b: "c" });
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
      const res = await post("/test", { a: ["a", "b"] });
      expect(await res.text()).toEqual("ok");
    });

    test("should match when pointer value matches a match function", async () => {
      mockr
        .when(request().body(pointer("/a/1", startsWith("b"))))
        .respond("ok");
      const res = await post("/test", { a: ["a", "b"] });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when pointer value is not equal", async () => {
      mockr.when(request().body(pointer("/a/1", "c"))).respond("ok");
      const res = await post("/test", { a: ["a", "b"] });
      expect(res.status).toEqual(404);
    });

    test("should not match when pointer path does not exist", async () => {
      mockr.when(request().body(pointer("/invalid/a/b", "c"))).respond("ok");
      const res = await post("/test", { a: ["a", "b"] });
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
      const res = await post("/test", { a: "b", b: [1], c: "d" });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when the object does not match partially", async () => {
      mockr.when(request().body(matchesObject({ a: "b" }))).respond("ok");
      const res = await post("/test", { b: "b" });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * oneOf()
   */

  describe("oneOf()", () => {
    test("should match when exactly one of the values matches", async () => {
      mockr.when(request().query("order", oneOf("asc", "desc"))).respond("ok");
      const res = await get("/test?order=asc");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when none of the values match", async () => {
      mockr.when(request().query("order", oneOf("asc", "desc"))).respond("ok");
      const res = await get("/test?order=none");
      expect(res.status).toEqual(404);
    });

    test("should not match when multiple values match", async () => {
      mockr
        .when(request().query("order", oneOf("asc", "desc", "asc")))
        .respond("ok");
      const res = await get("/test?order=asc");
      expect(res.status).toEqual(404);
    });

    test("should match when only one of the matchers matches", async () => {
      mockr
        .when(request().query("order", oneOf(startsWith("a"), endsWith("a"))))
        .respond("ok");
      const res = await get("/test?order=asc");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when multiple matchers match", async () => {
      mockr
        .when(request().query("order", oneOf(startsWith("a"), endsWith("c"))))
        .respond("ok");
      const res = await get("/test?order=invalid");
      expect(res.status).toEqual(404);
    });
  });
});
