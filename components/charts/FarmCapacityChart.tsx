"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import type { Farm } from "@/types";

interface Props { farms: Farm[]; topN?: number }

const REGION_COLORS: Record<string, string> = {
  "Meta":         "#3b82f6",
  "Cundinamarca": "#22c55e",
};

export default function FarmCapacityChart({ farms, topN = 10 }: Props) {
  const data = [...farms]
    .sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))
    .slice(0, topN)
    .map((f) => ({
      name: f.name.length > 14 ? f.name.slice(0, 12) + "…" : f.name,
      fullName: f.name,
      capacity: f.capacity ?? 0,
      region: f.region ?? "Otro",
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#64748b" }}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
        />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }}
          formatter={(v, _n, props) => [
            new Intl.NumberFormat("es-CO").format(v as number) + " aves",
            props.payload.fullName
          ]}
        />
        <Bar dataKey="capacity" radius={[4, 4, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={REGION_COLORS[entry.region] ?? "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
