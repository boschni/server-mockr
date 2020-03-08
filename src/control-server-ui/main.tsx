import React from "react";
import ReactDOM from "react-dom";

import { useHash } from "./hooks/useHash";
import { LogsPage } from "./pages/LogsPage";
import { ScenarioPage } from "./pages/ScenarioPage";
import { ScenarioRunnersPage } from "./pages/ScenarioRunnersPage";
import "./styles/main.css";

/*
 * COMPONENT
 */

const App: React.FC = () => {
  const hash = useHash();

  let content;

  switch (hash) {
    case "":
    case "#scenarios":
      content = <ScenarioPage />;
      break;
    case "#scenario-runners":
      content = <ScenarioRunnersPage />;
      break;
    case "#logs":
      content = <LogsPage />;
      break;
  }

  return (
    <div>
      <div className="header">
        <span className="header__logo">Server Mockr</span>
        <a className="header__btn" href="#scenarios">
          Scenarios
        </a>
        <a className="header__btn" href="#scenario-runners">
          Scenario runners
        </a>
        <a className="header__btn" href="#logs">
          Logs
        </a>
      </div>
      <div className="page__content">{content}</div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
