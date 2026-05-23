"use client";
import {
  Building2, AlertTriangle, Target, ClipboardCheck,
  Bird, TrendingUp, Clock, CheckCircle2, MapPin
} from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import Card, { CardHeader } from "@/components/ui/Card";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { computeAlerts } from "@/lib/alerts";
import FindingsBySeverity from "@/components/charts/FindingsBySeverity";
import FindingsByCategory from "@/components/charts/FindingsByCategory";
import KPIProgressChart from "@/components/charts/KPIProgressChart";
import FarmCapacityChart from "@/components/charts/FarmCapacityChart";
import Header from "@/components/layout/Header";
import type { Farm, Finding, KPIPlan, Audit } from "@/types";

interface Props {
  farms: Farm[];
  findings: Finding[];
  kpis: KPIPlan[];
  audits: Audit[];
}

export default function DashboardClient({ farms, findings, kpis, audits }: Props) {
  const alerts           = computeAlerts(findings, kpis, audits);
  const activeFarms      = farms.filter((f) => f.status === "activa").length;
  const criticalFindings = findings.filter((f) => f.severity === "critico").length;
  const openFindings     = findings.filter((f) => f.status === "abierto").length;
  const overdueKPIs      = kpis.filter((k) => k.kpi_status === "en_retraso").length;
  const completedKPIs    = kpis.filter((k) => k.kpi_status === "completado").length;
  const totalCapacity    = farms.reduce((s, f) => s + (f.capacity ?? 0), 0);
  const complianceAvg    = kpis.length
    ? Math.round(kpis.reduce((s, k) => s + (k.progress_pct ?? 0), 0) / kpis.length)
    : 0;

  const recentFindings = [...findings]
    .sort((a, b) => new Date(b.created_date ?? 0).getTime() - new Date(a.created_date ?? 0).getTime())
    .slice(0, 8);

  const recentKPIs = [...kpis]
    .filter((k) => k.kpi_status !== "completado")
    .sort((a, b) => new Date(a.commitment_date ?? 0).getTime() - new Date(b.commitment_date ?? 0).getTime())
    .slice(0, 6);

  const farmsByRegion = farms.reduce<Record<string, { count: number; capacity: number }>>((acc, f) => {
    const r = f.region ?? "Otro";
    if (!acc[r]) acc[r] = { count: 0, capacity: 0 };
    acc[r].count++;
    acc[r].capacity += f.capacity ?? 0;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard Ejecutivo"
        subtitle={`Control Interno · Savicol · ${new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
        alerts={alerts}
        actions={
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Datos en tiempo real · Base44 API
          </div>
        }
      />
    <div className="p-6 space-y-6 flex-1 overflow-y-auto">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Granjas Activas"
          value={activeFarms}
          subtitle={`de ${farms.length} totales`}
          icon={Building2}
          gradient="blue"
        />
        <KPICard
          title="Hallazgos Críticos"
          value={criticalFindings}
          subtitle={`${openFindings} abiertos`}
          icon={AlertTriangle}
          gradient="red"
        />
        <KPICard
          title="KPIs en Retraso"
          value={overdueKPIs}
          subtitle={`${completedKPIs} completados`}
          icon={Target}
          gradient="orange"
        />
        <KPICard
          title="Capacidad Total"
          value={totalCapacity >= 1_000_000
            ? `${(totalCapacity / 1_000_000).toFixed(2)}M`
            : `${Math.round(totalCapacity / 1000)}K`}
          subtitle="aves instaladas"
          icon={Bird}
          gradient="green"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Hallazgos",  value: findings.length,       icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
          { label: "Auditorías",       value: audits.length,         icon: ClipboardCheck, color: "text-blue-600 bg-blue-50" },
          { label: "Planes KPI",       value: kpis.length,           icon: Target, color: "text-purple-600 bg-purple-50" },
          { label: "Avance Promedio",  value: `${complianceAvg}%`,   icon: TrendingUp, color: "text-green-600 bg-green-50" },
        ].map((item) => (
          <Card key={item.label} padding="sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Hallazgos por Severidad" subtitle={`${findings.length} hallazgos registrados`} icon={AlertTriangle} />
          <FindingsBySeverity findings={findings} />
        </Card>
        <Card>
          <CardHeader title="Hallazgos por Categoría" icon={AlertTriangle} />
          <FindingsByCategory findings={findings} />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="KPIs por Granja y Estado" subtitle="Top 8 granjas" icon={Target} />
          <KPIProgressChart kpis={kpis} />
        </Card>
        <Card>
          <CardHeader title="Capacidad por Granja (Top 10)" icon={Building2} />
          <FarmCapacityChart farms={farms} topN={10} />
        </Card>
      </div>

      {/* Region Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Granjas por Región" icon={MapPin} />
          <div className="space-y-3 mt-2">
            {Object.entries(farmsByRegion)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([region, data]) => (
                <div key={region} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${region === "Meta" ? "bg-blue-500" : "bg-green-500"}`} />
                    <span className="text-sm font-medium text-slate-700">{region}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">{data.count} granjas</span>
                    <span className="text-xs text-slate-500 ml-2">
                      {data.capacity >= 1000 ? `${Math.round(data.capacity / 1000)}K aves` : `${data.capacity} aves`}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Recent findings */}
        <Card className="lg:col-span-2">
          <CardHeader title="Hallazgos Recientes" subtitle="Últimos 8 registrados" icon={AlertTriangle} />
          <div className="space-y-2">
            {recentFindings.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.title}</p>
                  <p className="text-xs text-slate-500">{f.farm_name} · {f.category} · {formatDate(f.visit_date)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending KPIs */}
      <Card>
        <CardHeader title="KPIs Pendientes por Vencer" subtitle="Ordenados por fecha de compromiso" icon={Clock} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentKPIs.map((k) => {
            const isOverdue = k.kpi_status === "en_retraso";
            return (
              <div
                key={k.id}
                className={`p-4 rounded-xl border ${isOverdue ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{k.title}</p>
                  <SeverityBadge severity={k.severity} />
                </div>
                <p className="text-xs text-slate-500 mb-2">{k.farm_name}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={k.kpi_status} />
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Vence</p>
                    <p className={`text-xs font-semibold ${isOverdue ? "text-red-600" : "text-slate-700"}`}>
                      {formatDate(k.commitment_date)}
                    </p>
                  </div>
                </div>
                {k.progress_pct !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Avance</span>
                      <span>{k.progress_pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isOverdue ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${k.progress_pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
    </div>
  );
}
