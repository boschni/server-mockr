import "jest";

import { proxyRequest, request, response, ServerMockr, startsWith } from "..";
import { get, post, setup } from "./utils";

describe("response.proxy()", () => {
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
    test("should proxy a text request", async () => {
      mockr.when("/some-api/test").respond("ok");

      mockr
        .when(request().url(startsWith("/some-api")))
        .respond(response().proxy("http://localhost:6273"));

      const res = await get("/some-api/test");
      expect(res.status).toEqual(200);
      expect(await res.text()).toEqual("ok");
    });

    test("should be able to override the path", async () => {
      mockr.when("/other-api/test").respond("ok");

      mockr
        .when("/some-api/test")
        .respond(
          response().proxy(
            proxyRequest("http://localhost:6273").path("/other-api/test")
          )
        );

      const res = await get("/some-api/test");
      expect(res.status).toEqual(200);
      expect(await res.text()).toEqual("ok");
    });

    test("should proxy a json request", async () => {
      mockr
        .when(
          request()
            .post("/test/test-2")
            .body({ b: "c" })
            .cookie("client-cookie", "client-cookie-value")
            .cookie("proxy-cookie", "proxy-cookie-value")
            .header("proxy-header", "proxy-header-value")
            .header("client-header", "client-header-value")
            .query("client-query", "client-query-value")
        )
        .respond(response({ a: "b" }).status(500));

      mockr
        .when("/test-2")
        .respond(
          response().proxy(
            proxyRequest("http://localhost:6273/test")
              .cookie("proxy-cookie", "proxy-cookie-value")
              .header("proxy-header", "proxy-header-value")
              .query("proxy-query", "proxy-query-value")
          )
        );

      const res = await post(
        "/test-2?client-query=client-query-value",
        { b: "c" },
        {
          "client-header": "client-header-value",
          Cookie: "client-cookie=client-cookie-value",
        }
      );

      expect(res.status).toEqual(500);
      expect(await res.json()).toEqual({ a: "b" });
    });
  });
});
