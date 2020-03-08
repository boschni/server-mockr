import "jest";

import { anyOf, matchesObject, not, request, ServerMockr } from "..";
import { del, get, post, setup } from "./utils";

describe("request()", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * REQUEST
   */

  describe("()", () => {
    test("should match on any request when given no input", async () => {
      mockr.when(request()).respond("ok");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should match on path when given a string", async () => {
      mockr.when(request("/test")).respond("ok");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });
  });

  /*
   * PATH
   */

  describe("path()", () => {
    test("should match on string path", async () => {
      mockr.when(request().path("/test")).respond("ok");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on string path", async () => {
      mockr.when(request().path("/test")).respond("ok");
      const res = await get("/invalid");
      expect(res.status).toEqual(404);
    });

    test("should match on string path without query params", async () => {
      mockr.when(request().path("/test")).respond("ok");
      const res = await get("/test?a=b");
      expect(await res.text()).toEqual("ok");
    });

    test("should match on string path param", async () => {
      mockr.when(request().path("/test/:id")).respond("ok");
      const res = await get("/test/1");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on string path param", async () => {
      mockr.when(request().path("/test/:id")).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });

    test("should put params on context", async () => {
      mockr.when(request().path("/test/:id")).respond(({ req }) => req.params);
      const res = await get("/test/1");
      expect(await res.json()).toEqual({ id: "1" });
    });

    test("should match on regex path", async () => {
      mockr
        .when(request().path(/\/test\/([0-9])/))
        .respond(({ req }) => req.params);
      const res = await get("/test/1");
      expect(await res.json()).toEqual({ "0": "1" });
    });

    test("should not match on regex path", async () => {
      mockr
        .when(request().path(/\/test\/([0-9])/))
        .respond(({ req }) => req.params);
      const res = await get("/test/invalid");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * PATH PARAM
   */

  describe("pathParam()", () => {
    test("should match on path param", async () => {
      mockr
        .when(
          request()
            .path("/test/:id")
            .param("id", "1")
        )
        .respond("ok");
      const res = await get("/test/1");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on path param", async () => {
      mockr
        .when(
          request()
            .path("/test/:id")
            .param("id", "1")
        )
        .respond("ok");
      const res = await get("/test/2");
      expect(res.status).toEqual(404);
    });

    test("should match on path param with match function", async () => {
      mockr
        .when(
          request()
            .path("/test/:id")
            .param("id", anyOf("1", "2"))
        )
        .respond("ok");
      const res = await get("/test/1");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on path param with match function", async () => {
      mockr
        .when(
          request()
            .path("/test/:id")
            .param("id", anyOf("1", "2"))
        )
        .respond("ok");
      const res = await get("/test/3");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * URL
   */

  describe("url()", () => {
    test("should match on url", async () => {
      mockr.when(request().url("/test?a=b&b=c")).respond("ok");
      const res = await get("/test?a=b&b=c");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on url", async () => {
      mockr.when(request().url("/test?a=b&b=c")).respond("ok");
      const res = await get("/test?b=c&a=b");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * METHOD
   */

  describe("method()", () => {
    test("should match on method", async () => {
      mockr.when(request().method("DELETE")).respond("ok");
      const res = await del("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on method", async () => {
      mockr.when(request().method("DELETE")).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });

    test("should match on custom match function", async () => {
      mockr.when(request().method(x => x === "POST")).respond("ok");
      const res = await post("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on custom match function", async () => {
      mockr.when(request().method(x => x === "POST")).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * BODY
   */

  describe("body()", () => {
    test("should match on json body", async () => {
      mockr.when(request().body({ a: "b" })).respond("ok");
      const res = await post("/test", { a: "b" });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on json body", async () => {
      mockr.when(request().body({ a: "b" })).respond("ok");
      const res = await post("/test", { b: "b" });
      expect(res.status).toEqual(404);
    });

    test("should match on form body", async () => {
      mockr.when(request().body({ a: "b" })).respond("ok");
      const body = new URLSearchParams({ a: "b" });
      const res = await post("/test", body);
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on form body", async () => {
      mockr.when(request().body({ a: "b" })).respond("ok");
      const body = new URLSearchParams({ a: "c" });
      const res = await post("/test", body);
      expect(res.status).toEqual(404);
    });

    test("should match on match function", async () => {
      mockr.when(request().body(matchesObject({ a: "b" }))).respond("ok");
      const res = await post("/test", { a: "b", b: "b" });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on match function", async () => {
      mockr.when(request().body(matchesObject({ a: "b" }))).respond("ok");
      const res = await post("/test", { b: "b" });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * QUERY
   */

  describe("query()", () => {
    test("should match on query string", async () => {
      mockr.when(request().query("a", "b")).respond("ok");
      const res = await get("/test?a=b");
      expect(await res.text()).toEqual("ok");
    });

    test("should match on array query string", async () => {
      mockr.when(request().query("a", ["b", "c"])).respond("ok");
      const res = await get("/test?a=b&a=c");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on missing query string", async () => {
      mockr.when(request().query("a", "b")).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });

    test("should not match on query string with different value", async () => {
      mockr.when(request().query("a", "b")).respond("ok");
      const res = await get("/test?a=c");
      expect(res.status).toEqual(404);
    });

    test("should match on match function", async () => {
      mockr.when(request().query("a", not("b"))).respond("ok");
      const res = await get("/test?a=c");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on match function", async () => {
      mockr.when(request().query("a", not("b"))).respond("ok");
      const res = await get("/test?a=b");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * HEADER
   */

  describe("header()", () => {
    test("should match on header", async () => {
      mockr.when(request().header("Authorization", "token")).respond("ok");
      const res = await post("/test", undefined, { Authorization: "token" });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on header if the value does not match", async () => {
      mockr.when(request().header("Authorization", "token")).respond("ok");
      const res = await post("/test", undefined, { Authorization: "invalid" });
      expect(res.status).toEqual(404);
    });

    test("should match on multiple headers", async () => {
      mockr
        .when(
          request()
            .header("Authorization", "token")
            .header("Accept", "application/json")
        )
        .respond("ok");
      const res = await post("/test", undefined, {
        Authorization: "token",
        Accept: "application/json"
      });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on multiple headers if one value does not match", async () => {
      mockr
        .when(
          request()
            .header("Authorization", "token")
            .header("Accept", "application/json")
        )
        .respond("ok");
      const res = await post("/test", undefined, {
        Authorization: "invalid",
        Accept: "application/json"
      });
      expect(res.status).toEqual(404);
    });

    test("should match on match function", async () => {
      mockr.when(request().header("Authorization", not("token"))).respond("ok");
      const res = await post("/test", undefined, {
        Authorization: "something"
      });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match match function", async () => {
      mockr.when(request().header("Authorization", not("token"))).respond("ok");
      const res = await post("/test", undefined, {
        Authorization: "token"
      });
      expect(res.status).toEqual(404);
    });
  });

  /*
   * COOKIE
   */

  describe("cookie()", () => {
    test("should match on cookie", async () => {
      mockr.when(request().cookie("a", "b")).respond("ok");
      const res = await post("/test", undefined, {
        Cookie: "a=b"
      });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on cookie if the value does not match", async () => {
      mockr.when(request().cookie("a", "b")).respond("ok");
      const res = await post("/test", undefined, {
        Cookie: "a=c"
      });
      expect(res.status).toEqual(404);
    });

    test("should match on multiple cookies", async () => {
      mockr
        .when(
          request()
            .cookie("a", "b")
            .cookie("b", "c")
        )
        .respond("ok");
      const res = await post("/test", undefined, {
        Cookie: "a=b; b=c"
      });
      expect(await res.text()).toEqual("ok");
    });

    test("should not match on multiple cookies if a value does not match", async () => {
      mockr
        .when(
          request()
            .cookie("a", "b")
            .cookie("b", "c")
        )
        .respond("ok");
      const res = await post("/test", undefined, {
        Cookie: "a=b; b=d"
      });
      expect(res.status).toEqual(404);
    });
  });
});
