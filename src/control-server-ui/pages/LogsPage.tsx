import React from "react";

/*
 * COMPONENT
 */

export const LogsPage: React.FC = () => {
  return (
    <div>
      <h1>Logs</h1>
      <a href="/api/logging/har" target="_blank">
        View HAR
      </a>
      <p>Or:</p>
      <a href="/api/logging/har" download="mockr.har">
        Download HAR
      </a>
    </div>
  );
};
