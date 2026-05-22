"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import type { KPIPlan } from "@/types";

interface Props { kpis: KPIPlan[] }

const STATUS_LABELS: Record<string, string> = {
  completado:  "Completado",
  en_retraso:  "En Retraso",
  en_espera:   "En Espera",
  no_iniciado: "No Iniciado",
  en_curso:    "En Curso",
};

const STATUS_COLORS: Record<string, string> = {
  completado:  "#22c55e",
  en_retraso:  "#ef4444",
  en_espera:   "#eab308",
  no_iniciado: "#94a3b8",
  en_curso:    "#3b82f6",
};

export default function KPIProgressChart({ kpis }: Props) {
  // Group by farm, count statuses
  const farmData: Record<string, Record<string, number>> = {};

  kpis.forEach((k) => {
    const farm = k.farm_name?.length > 12 ? k.farm_name.slice(0, 10) + "…" : (k.farm_name ?? "N/A");
    if (!farmData[farm]) farmData[farm] = {};
    farmData[farm][k.kpi_status] = (farmData[farm][k.kpi_status] ?? 0) + 1;
  });

  const topFarms = Object.entries(farmData)
    .map(([name, statuses]) => ({ name, ...statuses, total: Object.values(statuses).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const statuses = ["completado", "en_curso", "en_espera", "en_retraso", "no_iniciado"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topFarms} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)", fontSize: 12 }}
        />
        <Legend
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: "#475569" }}>{STATUS_LABELS[v] ?? v}</span>}
        />
        {statuses.map((s) => (
          <Bar key={s} dataKey={s} name={s} stackId="a" fill={STATUS_COLORS[s]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
