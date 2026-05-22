"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import type { Finding } from "@/types";

const COLORS = [
  "#3b82f6","#f97316","#ef4444","#22c55e",
  "#8b5cf6","#ec4899","#14b8a6","#f59e0b",
];

interface Props { findings: Finding[] }

export default function FindingsByCategory({ findings }: Props) {
  const counts = findings.reduce<Record<string, number>>((acc, f) => {
    const k = f.category ?? "Otro";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts)
    .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, value, fullName: name }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis
          dataKey="name"
          type="category"
          width={130}
          tick={{ fontSize: 11, fill: "#475569" }}
        />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }}
          formatter={(v, _name, props) => [`${v} hallazgos`, props.payload.fullName]}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
