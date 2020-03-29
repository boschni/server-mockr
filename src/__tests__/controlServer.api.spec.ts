import "jest";

import { config, response, ServerMockr, state } from "..";
import { controlUrl, get, mockUrl, post, setup } from "./utils";

describe("controlServer", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * GET /api/scenarios/:id/start
   */

  describe("GET /api/scenarios/:id/start", () => {
    test("should start a scenario", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");

      const controlRes = await post(controlUrl("/api/scenarios/id/start"));
      expect(await controlRes.json()).toEqual({
        runnerId: 1,
        scenarioId: "id",
        status: "STARTED"
      });

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should be able to set config", async () => {
      mockr
        .scenario("id")
        .config("language", { type: "string", default: "en" })
        .when("/test", config("language", "nl"))
        .respond("ok");

      await post(controlUrl("/api/scenarios/id/start?config[language]=nl"));

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should be able to set state", async () => {
      mockr
        .scenario("id")
        .state("language", { type: "string", default: "en" })
        .when("/test", state("language", "nl"))
        .respond("ok");

      await post(controlUrl("/api/scenarios/id/start?state[language]=nl"));

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });
  });

  /*
   * GET /api/scenarios/:id/start-and-bootstrap
   */

  describe("GET /api/scenarios/:id/start-and-bootstrap", () => {
    test("should start a scenario", async () => {
      mockr
        .scenario("id")
        .onBootstrap(() => response().redirect(mockUrl("/redirected")))
        .when("/redirected")
        .respond("redirected");

      const controlRes = await get(
        controlUrl("/api/scenarios/id/start-and-bootstrap")
      );
      expect(await controlRes.text()).toEqual("redirected");
    });

    test("should be able to set config", async () => {
      mockr
        .scenario("id")
        .config("language", { type: "string", default: "en" })
        .when("/test", config("language", "nl"))
        .respond("ok");

      await get(
        controlUrl("/api/scenarios/id/start-and-bootstrap?config[language]=nl")
      );

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should be able to set state", async () => {
      mockr
        .scenario("id")
        .state("language", { type: "string", default: "en" })
        .when("/test", state("language", "nl"))
        .respond("ok");

      await get(
        controlUrl("/api/scenarios/id/start-and-bootstrap?state[language]=nl")
      );

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });
  });

  /*
   * GET /api/scenarios/:id/stop
   */

  describe("GET /api/scenarios/:id/stop", () => {
    test("should stop a scenario", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");

      await post(controlUrl("/api/scenarios/id/start"));
      await post(controlUrl("/api/scenarios/id/stop"));
      const mockRes = await get("/test");
      expect(mockRes.status).toEqual(404);
    });
  });
});
