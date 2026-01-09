import { formatMetric, Metric } from "@sentinel/core-engine";
import React from "react";

export default function App() {
  const m: Metric = { name: "requests", value: 123 };
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Sentinel Dashboard</h1>
      <p>{formatMetric(m)}</p>
    </div>
  );
}
