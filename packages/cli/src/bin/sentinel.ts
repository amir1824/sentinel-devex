#!/usr/bin/env node
import { formatMetric, Metric, version } from "@sentinel/core-engine";

const m: Metric = { name: "uptime", value: 42 };
console.log("Sentinel CLI", version);
console.log(formatMetric(m));
