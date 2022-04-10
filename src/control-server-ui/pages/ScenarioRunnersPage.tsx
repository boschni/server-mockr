import React from "react";

import { ApiScenarioRunner } from "../../control-server/ControlServer";
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHead,
  TableHeadCell,
  TableHeadRow,
} from "../components/Table";
import { useFetch } from "../hooks/useFetch";
import { usePersistentState } from "../hooks/usePersistentState";
import { fuzzyMatch } from "../utils/string";

/*
 * COMPONENT
 */

export const ScenarioRunnersPage: React.FC = () => {
  const [scenarioIdFilter, setScenarioIdFilter] = usePersistentState(
    "runners-scenario-id-filter",
    ""
  );

  const runnersFetch = useFetch<ApiScenarioRunner[]>("/api/scenario-runners");
  const runners = runnersFetch.data;

  if (!runners) {
    return null;
  }

  const filteredRunners = runners.filter((runner) =>
    fuzzyMatch(runner.scenarioId, scenarioIdFilter)
  );

  async function stopRunner(runner: ApiScenarioRunner) {
    await fetch(`/api/scenario-runners/${runner.id}/stop`, { method: "POST" });
    runnersFetch.refetch();
  }

  async function resetRunner(runner: ApiScenarioRunner) {
    await fetch(`/api/scenario-runners/${runner.id}/reset`, { method: "POST" });
    runnersFetch.refetch();
  }

  return (
    <div>
      <h1>Scenario runners</h1>
      <div className="filters">
        <div className="filters__item">
          Filter by scenario ID:{" "}
          <input
            type="text"
            value={scenarioIdFilter}
            onChange={(e) => setScenarioIdFilter(e.target.value)}
          />
        </div>
      </div>
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeadCell style={{ width: "100px" }}>ID</TableHeadCell>
            <TableHeadCell>Scenario ID</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell style={{ width: "200px" }}>Started</TableHeadCell>
            <TableHeadCell style={{ width: "200px", textAlign: "right" }}>
              Actions
            </TableHeadCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {filteredRunners.map((runner) => (
            <React.Fragment key={runner.id}>
              <TableBodyRow
                row={
                  <React.Fragment>
                    <TableBodyCell>{runner.id}</TableBodyCell>
                    <TableBodyCell>{runner.scenarioId}</TableBodyCell>
                    <TableBodyCell>{runner.status}</TableBodyCell>
                    <TableBodyCell>
                      {runner.startedDateTime &&
                        String(
                          new Date(runner.startedDateTime).getHours()
                        ).padStart(2, "0")}
                      :
                      {runner.startedDateTime &&
                        String(
                          new Date(runner.startedDateTime).getMinutes()
                        ).padStart(2, "0")}
                    </TableBodyCell>
                    <TableBodyCell style={{ textAlign: "right" }}>
                      <button onClick={() => stopRunner(runner)}>Stop</button>
                      <button onClick={() => resetRunner(runner)}>Reset</button>
                      <form
                        action={`/api/scenario-runners/${runner.id}/bootstrap`}
                        method="GET"
                        target="_blank"
                      >
                        <button type="submit">Bootstrap</button>
                      </form>
                      <form
                        action={`/api/scenario-runners/${runner.id}/har`}
                        method="GET"
                        target="_blank"
                      >
                        <button type="submit">Logs</button>
                      </form>
                    </TableBodyCell>
                  </React.Fragment>
                }
                expandableRow={
                  <React.Fragment>
                    <TableBodyCell colSpan={3}>
                      {runner.config && (
                        <React.Fragment>
                          <h2>Config</h2>
                          <pre>{JSON.stringify(runner.config)}</pre>
                        </React.Fragment>
                      )}
                      {runner.state && (
                        <React.Fragment>
                          <h2>State</h2>
                          <pre>{JSON.stringify(runner.state)}</pre>
                        </React.Fragment>
                      )}
                    </TableBodyCell>
                  </React.Fragment>
                }
              />
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
