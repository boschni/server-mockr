import React from "react";

import { ApiScenario } from "../../control-server/ControlServer";
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

export const ScenarioPage: React.FC = () => {
  const [idFilter, setIdFilter] = usePersistentState("id-filter", "");
  const [tagFilter, setTagFilter] = usePersistentState("tag-filter", "");

  const scenariosFetch = useFetch<ApiScenario[]>("/api/scenarios");
  const scenarios = scenariosFetch.data;

  if (!scenarios) {
    return null;
  }

  const filteredScenarios = scenarios.filter(
    (scenario) =>
      fuzzyMatch(scenario.id, idFilter) &&
      fuzzyMatch(scenario.tags.join(","), tagFilter)
  );

  async function startScenario(scenario: ApiScenario) {
    await fetch(`/api/scenarios/${scenario.id}/scenario-runners`, {
      method: "POST",
    });
    scenariosFetch.refetch();
  }

  async function stopScenario(scenario: ApiScenario) {
    await fetch(`/api/scenarios/${scenario.id}/scenario-runners/stop`, {
      method: "POST",
    });
    scenariosFetch.refetch();
  }

  async function onClickFormStartButton(
    e: React.MouseEvent<HTMLElement>,
    scenario: ApiScenario
  ) {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    const target = e.target as HTMLButtonElement;
    const form = target.closest("form");

    if (!form) {
      return;
    }

    const formData = new FormData(form);

    for (const [key, value] of formData) {
      searchParams.append(key, value.toString());
    }

    await fetch(
      `/api/scenarios/${
        scenario.id
      }/scenario-runners?${searchParams.toString()}`,
      { method: "POST" }
    );

    scenariosFetch.refetch();
  }

  return (
    <div>
      <h1>Scenarios</h1>
      <div className="filters">
        <div className="filters__item">
          Filter by ID:{" "}
          <input
            type="text"
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
          />
        </div>
        <div className="filters__item">
          Filter by tag:{" "}
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
        </div>
      </div>
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeadCell style={{ width: "40%" }}>ID</TableHeadCell>
            <TableHeadCell style={{ width: "20%" }}>Tags</TableHeadCell>
            <TableHeadCell style={{ width: "100px", textAlign: "center" }}>
              Runners
            </TableHeadCell>
            <TableHeadCell style={{ width: "100px", textAlign: "right" }}>
              Actions
            </TableHeadCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {filteredScenarios.map((scenario) => (
            <React.Fragment key={scenario.id}>
              <TableBodyRow
                row={
                  <React.Fragment>
                    <TableBodyCell>{scenario.id}</TableBodyCell>
                    <TableBodyCell>{scenario.tags.join(", ")}</TableBodyCell>
                    <TableBodyCell style={{ textAlign: "center" }}>
                      {scenario.runners.length}
                    </TableBodyCell>
                    <TableBodyCell style={{ textAlign: "right" }}>
                      <button onClick={() => startScenario(scenario)}>
                        Start
                      </button>
                      <button onClick={() => stopScenario(scenario)}>
                        Stop
                      </button>
                      <form
                        action={`/api/scenarios/${scenario.id}/scenario-runners/create-and-bootstrap`}
                        method="GET"
                        target="_blank"
                        onSubmit={() => {
                          setTimeout(() => scenariosFetch.refetch(), 100);
                        }}
                      >
                        <button type="submit">Start & Bootstrap</button>
                      </form>
                    </TableBodyCell>
                  </React.Fragment>
                }
                expandableRow={
                  <React.Fragment>
                    <TableBodyCell colSpan={4}>
                      {scenario.description && (
                        <React.Fragment>
                          <h2>Description</h2>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: scenario.description,
                            }}
                          />
                        </React.Fragment>
                      )}

                      {scenario.configDefinitions.length > 0 && (
                        <React.Fragment>
                          <h2>Config</h2>
                          <form
                            className="form"
                            action={`/api/scenarios/${scenario.id}/scenario-runners/create-and-bootstrap`}
                            method="GET"
                            target="_blank"
                            onSubmit={() => {
                              setTimeout(() => scenariosFetch.refetch(), 100);
                            }}
                          >
                            {scenario.configDefinitions.map(
                              ({ name, schema }) => (
                                <div key={name} className="form__field">
                                  <label
                                    className="form__label"
                                    htmlFor={`config_${name}`}
                                  >
                                    {name}
                                  </label>
                                  {schema.type === "string" && !schema.enum && (
                                    <input
                                      id={`config_${name}`}
                                      name={`config[${name}]`}
                                      type="text"
                                      defaultValue={schema.default}
                                    />
                                  )}
                                  {schema.type === "string" && schema.enum && (
                                    <select
                                      id={`config_${name}`}
                                      name={`config[${name}]`}
                                      defaultValue={schema.default}
                                    >
                                      <option value="">Select</option>
                                      {schema.enum.map((enumValue) => (
                                        <option
                                          key={enumValue}
                                          value={enumValue}
                                        >
                                          {enumValue}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              )
                            )}
                            <button
                              onClick={(e) =>
                                onClickFormStartButton(e, scenario)
                              }
                            >
                              Start
                            </button>
                            <button type="submit">Start & Bootstrap</button>
                          </form>
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
