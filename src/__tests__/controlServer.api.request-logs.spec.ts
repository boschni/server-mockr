import "jest";

import { ServerMockr } from "..";
import {
  ApiCreateScenarioRunnerSuccessResponse,
  ApiGetScenarioRunnerHARSuccessResponse,
} from "../control-server/ControlServer";
import { controlUrl, get, post, setup } from "./utils";

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
   * POST /api/scenarios/:id/scenario-runners
   */

  describe("logs", () => {
    test("should log a matching request", async () => {
      mockr.scenario("id").when("/test").respond("ok");

      const createRes = await post(
        controlUrl("/api/scenarios/id/scenario-runners")
      );
      const runner: ApiCreateScenarioRunnerSuccessResponse =
        await createRes.json();

      await post("/test", { a: "b" });

      const harRes = await get(
        controlUrl(`/api/scenario-runners/${runner.id}/har`)
      );
      const har: ApiGetScenarioRunnerHARSuccessResponse = await harRes.json();

      expect(har).toMatchObject({
        log: {
          entries: [
            {
              _id: 1,
              _requestValue: {
                path: "/test",
              },
              _responseValue: {
                body: "ok",
              },
              _url: "/test",
              request: {
                postData: {
                  mimeType: "application/json",
                  text: '{"a":"b"}',
                },
              },
              response: {
                content: {
                  mimeType: "text/plain",
                  text: "ok",
                },
              },
            },
          ],
        },
      });
    });

    test("should log a non matching request", async () => {
      mockr.scenario("id").when("/test").respond("ok");

      const createRes = await post(
        controlUrl("/api/scenarios/id/scenario-runners")
      );
      const runner: ApiCreateScenarioRunnerSuccessResponse =
        await createRes.json();

      await get("/test-2");

      const harRes = await get(
        controlUrl(`/api/scenario-runners/${runner.id}/har`)
      );
      const har: ApiGetScenarioRunnerHARSuccessResponse = await harRes.json();

      expect(har).toMatchObject({
        log: {
          entries: [
            {
              _id: 2,
              _requestValue: {
                path: "/test-2",
              },
              _responseValue: {
                body: "server-mockr: Not Found",
                status: 404,
              },
            },
          ],
        },
      });
    });
  });
});
