import React from "react";

/*
 * COMPONENT
 */

export const LogsPage: React.FC = () => {
  return (
    <div>
      <h1>Logs</h1>
      <a href="/api/request-logs" target="_blank">
        View all request logs
      </a>
    </div>
  );
};
