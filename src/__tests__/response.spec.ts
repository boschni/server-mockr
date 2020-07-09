import "jest";

import { response, ServerMockr } from "..";
import { get, setup } from "./utils";

describe("response()", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * RESPOND
   */

  describe("()", () => {
    test("should respond with a status 200", async () => {
      mockr.when("/test").respond(response());
      const res = await get("/test");
      expect(res.status).toEqual(200);
      expect(await res.text()).toEqual("");
    });

    test("should respond with a status 200 text response when given a string", async () => {
      mockr.when("/test").respond(response("ok"));
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should respond with a status 200 json response when given an object", async () => {
      mockr.when("/test").respond(response({ a: "b" }));
      const res = await get("/test");
      expect(await res.json()).toEqual({ a: "b" });
    });
  });

  /*
   * STATUS
   */

  describe(".status()", () => {
    test("should respond with correct status", async () => {
      mockr.when("/test").respond(response("error").status(500));
      const res = await get("/test");
      expect(await res.text()).toEqual("error");
      expect(res.status).toEqual(500);
    });

    test("should respond when only status is set", async () => {
      mockr.when("/test").respond(response().status(500));
      const res = await get("/test");
      expect(await res.text()).toEqual("");
      expect(res.status).toEqual(500);
    });
  });

  /*
   * HEADER
   */

  describe(".header()", () => {
    test("should respond with correct header", async () => {
      mockr
        .when("/test")
        .respond(response().header("Cache-Control", "no-store"));
      const res = await get("/test");
      expect(res.headers.get("cache-control")).toEqual("no-store");
    });

    test("should respond with correct multiple headers", async () => {
      mockr
        .when("/test")
        .respond(
          response()
            .header("Cache-Control", "no-store")
            .header("Server", "mockr")
        );
      const res = await get("/test");
      expect(res.headers.get("server")).toEqual("mockr");
      expect(res.headers.get("cache-control")).toEqual("no-store");
    });
  });

  /*
   * COOKIE
   */

  describe(".cookie()", () => {
    test("should respond with correct Set-Cookie header", async () => {
      mockr.when("/test").respond(response().cookie("a", "b"));
      const res = await get("/test");
      expect(res.headers.get("set-cookie")).toEqual("a=b");
    });

    test("should respond with correct Set-Cookie header for multiple cookies", async () => {
      mockr.when("/test").respond(response().cookie("a", "b").cookie("b", "c"));
      const res = await get("/test");
      expect(res.headers.get("set-cookie")).toEqual("a=b, b=c");
    });

    test("should respond with correct Set-Cookie header with options", async () => {
      mockr
        .when("/test")
        .respond(response().cookie("a", "b", { httpOnly: true }));
      const res = await get("/test");
      expect(res.headers.get("set-cookie")).toEqual("a=b; HttpOnly");
    });
  });

  /*
   * DELAY
   */

  describe(".delay()", () => {
    test("should respond with no delay", async () => {
      mockr.when("/test").respond(response("ok").delay(100));
      const start = Date.now();
      const res = await get("/test");
      const duration = Date.now() - start;
      expect(await res.text()).toEqual("ok");
      expect(duration).toBeLessThan(150);
    });

    test("should respond with correct delay", async () => {
      mockr.when("/test").respond(response("ok").delay(200));
      const start = Date.now();
      const res = await get("/test");
      const duration = Date.now() - start;
      expect(await res.text()).toEqual("ok");
      expect(duration).toBeGreaterThanOrEqual(200);
    });

    test("should respond between a minimum and maximum delay", async () => {
      mockr.when("/test").respond(response("ok").delay(200, 400));
      const start = Date.now();
      const res = await get("/test");
      const duration = Date.now() - start;
      expect(await res.text()).toEqual("ok");
      expect(duration).toBeGreaterThanOrEqual(200);
      expect(duration).toBeLessThanOrEqual(450);
    });
  });
});
