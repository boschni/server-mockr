const useFetch = (url, options) => {
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState(null);

  async function fetchData() {
    try {
      const res = await fetch(url, options);
      const json = await res.json();
      setResponse(json);
    } catch (error) {
      setError(error);
    }
  }

  const refetch = React.useCallback(fetchData, [url]);

  React.useEffect(() => {
    fetchData();
  }, [url]);

  return { response, error, refetch };
};

const ScenarioPage = () => {
  const scenariosFetch = useFetch("/api/scenarios");

  const [idFilter, setIdFilter] = React.useState(
    () => localStorage.getItem("id-filter") || ""
  );

  const [tagFilter, setTagFilter] = React.useState(
    () => localStorage.getItem("tag-filter") || ""
  );

  const [
    expandedScenarioIds,
    setExpandedScenarioIds
  ] = React.useState(() => []);

  if (!scenariosFetch.response) {
    return null;
  }

  const scenarios = scenariosFetch.response;

  function matchesValue(input, value) {
    const words = input.trim().split(" ");
    const matchWords = words.every(word => value.includes(word));
    return input === "" || matchWords;
  }

  const filteredScenarios = scenarios.filter(
    scenario =>
      matchesValue(idFilter, scenario.id) &&
      matchesValue(tagFilter, scenario.tags.join(","))
  );

  function onChangeIdFilter(e) {
    localStorage.setItem("id-filter", e.target.value);
    setIdFilter(e.target.value);
  }

  function onChangeTagFilter(e) {
    localStorage.setItem("tag-filter", e.target.value);
    setTagFilter(e.target.value);
  }

  function onClickScenarioRow(e, scenario) {
    if (e.target.tagName !== "BUTTON") {
      toggleScenarioRow(scenario);
    }
  }

  function toggleScenarioRow(scenario) {
    let ids = expandedScenarioIds;

    if (expandedScenarioIds.includes(scenario.id)) {
      ids = expandedScenarioIds.filter(x => x !== scenario.id);
    } else {
      ids = [...expandedScenarioIds, scenario.id];
    }

    setExpandedScenarioIds(ids);
  }

  async function startScenario(scenario) {
    await fetch(`/api/scenarios/${scenario.id}/start`, { method: "POST" });
    scenariosFetch.refetch();
  }

  async function stopScenario(scenario) {
    await fetch(`/api/scenarios/${scenario.id}/stop`, { method: "POST" });
    scenariosFetch.refetch();
  }

  async function resetScenario(scenario) {
    await fetch(`/api/scenarios/${scenario.id}/reset`, { method: "POST" });
    scenariosFetch.refetch();
  }

  async function onClickFormStartButton(e, scenario) {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    const form = e.target.closest("form");
    const formData = new FormData(form);

    for (const [key, value] of formData) {
      searchParams.append(key, value);
    }

    await fetch(
      `/api/scenarios/${scenario.id}/start?${searchParams.toString()}`,
      { method: "POST" }
    );
    scenariosFetch.refetch();
  }

  return (
    <div>
      <a href="/api/request-logs" target="_blank">
        View request logs
      </a>
      <h1>Scenarios</h1>
      <div className="filters">
        <div className="filters__item">
          Filter by ID:{" "}
          <input type="text" value={idFilter} onChange={onChangeIdFilter} />
        </div>
        <div className="filters__item">
          Filter by tag:{" "}
          <input type="text" value={tagFilter} onChange={onChangeTagFilter} />
        </div>
      </div>
      <table className="scenario-table">
        <thead>
          <tr>
            <th className="scenario-table__th scenario-table__th-id">ID</th>
            <th className="scenario-table__th scenario-table__th-tags">Tags</th>
            <th className="scenario-table__th scenario-table__th-status">
              Runners
            </th>
            <th className="scenario-table__th scenario-table__th-actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredScenarios.map(scenario => (
            <React.Fragment key={scenario.id}>
              <tr
                className="scenario-table__summary-row"
                onClick={e => onClickScenarioRow(e, scenario)}
              >
                <td className="scenario-table__col-id">{scenario.id}</td>
                <td className="scenario-table__col-tags">
                  {scenario.tags.join(", ")}
                </td>
                <td className="scenario-table__col-status">
                  {scenario.runners.length}
                </td>
                <td className="scenario-table__col-actions">
                  <button onClick={() => startScenario(scenario)}>Start</button>
                  <button onClick={() => stopScenario(scenario)}>Stop</button>
                  <button onClick={() => resetScenario(scenario)}>Reset</button>
                  <form
                    action={`/api/scenarios/${scenario.id}/start-and-bootstrap`}
                    method="GET"
                    target="_blank"
                  >
                    <button type="submit">Start & Bootstrap</button>
                  </form>
                </td>
              </tr>
              <tr
                className={`scenario-table__details-row ${
                  expandedScenarioIds.includes(scenario.id) ? "is-open" : ""
                }`}
              >
                <td colSpan="4">
                  {scenario.description && (
                    <React.Fragment>
                      <h2>Description</h2>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: scenario.description
                        }}
                      />
                    </React.Fragment>
                  )}

                  {scenario.configDefinitions.length > 0 && (
                    <React.Fragment>
                      <h2>Config</h2>
                      <form
                        className="form"
                        action={`/api/scenarios/${scenario.id}/start-and-bootstrap`}
                        method="GET"
                        target="_blank"
                      >
                        {scenario.configDefinitions.map(({ name, schema }) => (
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
                                {schema.enum.map(enumValue => (
                                  <option key={enumValue} value={enumValue}>
                                    {enumValue}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={e => onClickFormStartButton(e, scenario)}
                        >
                          Start
                        </button>
                        <button type="submit">Start & Bootstrap</button>
                      </form>
                    </React.Fragment>
                  )}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ReactDOM.render(<ScenarioPage />, document.querySelector(".container"));
