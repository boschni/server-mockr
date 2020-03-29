import "jest";

import { ServerMockr } from "..";
import {
  ApiScenarioRunnersRequestLogsSuccessResponse,
  ApiScenariosStartSuccessResponse
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
   * GET /api/scenarios/:id/start
   */

  describe("logs", () => {
    test("should log a matching request", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");

      const controlRes = await post(controlUrl("/api/scenarios/id/start"));
      const controlJson: ApiScenariosStartSuccessResponse = await controlRes.json();

      await get("/test");

      const logRes = await get(
        controlUrl(`/api/scenario-runners/${controlJson.runnerId}/request-logs`)
      );
      const logJson: ApiScenarioRunnersRequestLogsSuccessResponse = await logRes.json();

      expect(logJson).toMatchObject({
        log: {
          entries: [
            {
              _id: 1,
              _requestValue: {
                path: "/test"
              },
              _responseValue: {
                body: "ok"
              },
              _url: "/test"
            }
          ]
        }
      });
    });

    test("should log a non matching request", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");

      const controlRes = await post(controlUrl("/api/scenarios/id/start"));
      const controlJson: ApiScenariosStartSuccessResponse = await controlRes.json();

      await get("/test-2");

      const logRes = await get(
        controlUrl(`/api/scenario-runners/${controlJson.runnerId}/request-logs`)
      );
      const logJson: ApiScenarioRunnersRequestLogsSuccessResponse = await logRes.json();

      expect(logJson).toMatchObject({
        log: {
          entries: [
            {
              _id: 2,
              _requestValue: {
                path: "/test-2"
              },
              _responseValue: {
                body: "server-mockr: Not Found",
                status: 404
              }
            }
          ]
        }
      });
    });
  });
});
