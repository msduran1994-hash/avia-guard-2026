"use client";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import type { Finding } from "@/types";

const COLORS = {
  critico: "#ef4444",
  alto:    "#f97316",
  medio:   "#eab308",
  bajo:    "#22c55e",
};
const LABELS = {
  critico: "Crítico",
  alto:    "Alto",
  medio:   "Medio",
  bajo:    "Bajo",
};

interface Props { findings: Finding[] }

export default function FindingsBySeverity({ findings }: Props) {
  const counts = findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts)
    .map(([key, value]) => ({
      name: LABELS[key as keyof typeof LABELS] ?? key,
      value,
      key,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell
              key={entry.key}
              fill={COLORS[entry.key as keyof typeof COLORS] ?? "#94a3b8"}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }}
          formatter={(v) => [`${v} hallazgos`, ""]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 12, color: "#475569" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
