"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, Target, ClipboardCheck, Clock, Bell, CheckCircle2 } from "lucide-react";
import type { Finding, KPIPlan, Audit } from "@/types";
import Header from "@/components/layout/Header";
import Card, { CardHeader } from "@/components/ui/Card";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { computeAlerts } from "@/lib/alerts";
import Link from "next/link";

interface Props {
  findings: Finding[];
  kpis: KPIPlan[];
  audits: Audit[];
}

const TABS = [
  { key: "all",                label: "Todas",           icon: Bell },
  { key: "critico",            label: "Críticos",        icon: AlertTriangle },
  { key: "kpi_retraso",        label: "KPIs Retrasados", icon: Target },
  { key: "auditoria_pendiente",label: "Auditorías",      icon: ClipboardCheck },
  { key: "kpi_vence",          label: "Por Vencer",      icon: Clock },
] as const;

export default function NotificacionesClient({ findings, kpis, audits }: Props) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const alerts = useMemo(() => computeAlerts(findings, kpis, audits), [findings, kpis, audits]);

  const filtered = activeTab === "all" ? alerts : alerts.filter((a) => a.type === activeTab);

  const counts = useMemo(() => ({
    all:                 alerts.length,
    critico:             alerts.filter((a) => a.type === "critico").length,
    kpi_retraso:         alerts.filter((a) => a.type === "kpi_retraso").length,
    auditoria_pendiente: alerts.filter((a) => a.type === "auditoria_pendiente").length,
    kpi_vence:           alerts.filter((a) => a.type === "kpi_vence").length,
  }), [alerts]);

  const TYPE_COLORS = {
    critico:             { bg: "bg-red-50",     border: "border-red-200",    icon: AlertTriangle, color: "text-red-600",    label: "Hallazgo Crítico" },
    kpi_retraso:         { bg: "bg-orange-50",  border: "border-orange-200", icon: Target,        color: "text-orange-600", label: "KPI en Retraso" },
    auditoria_pendiente: { bg: "bg-blue-50",    border: "border-blue-200",   icon: ClipboardCheck,color: "text-blue-600",   label: "Auditoría Pendiente" },
    kpi_vence:           { bg: "bg-yellow-50",  border: "border-yellow-200", icon: Clock,         color: "text-yellow-600", label: "Próximo a Vencer" },
  } as const;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Notificaciones y Alertas"
        subtitle={`${alerts.length} alertas activas · actualizado en tiempo real`}
        alerts={alerts}
      />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Hallazgos Críticos",  value: counts.critico,             color: "text-red-600",    bg: "bg-red-50",    icon: AlertTriangle },
            { label: "KPIs en Retraso",      value: counts.kpi_retraso,         color: "text-orange-600", bg: "bg-orange-50", icon: Target },
            { label: "Auditorías Pendientes",value: counts.auditoria_pendiente, color: "text-blue-600",   bg: "bg-blue-50",   icon: ClipboardCheck },
            { label: "KPIs Por Vencer",      value: counts.kpi_vence,           color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock },
          ].map((s) => (
            <Card key={s.label} padding="sm">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => {
            const count = counts[tab.key as keyof typeof counts];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-brand-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Alerts list */}
        <Card padding="none">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Sin alertas en esta categoría</p>
              <p className="text-sm text-slate-400 mt-1">Todo está bajo control</p>
            </div>
          ) : (
            <div>
              {filtered.map((alert, idx) => {
                const cfg = TYPE_COLORS[alert.type];
                const Icon = cfg.icon;
                return (
                  <Link
                    key={alert.id}
                    href={alert.href}
                    className={`flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${
                      idx < filtered.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${cfg.bg} border ${cfg.border} flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{alert.subtitle}</p>
                      {alert.date && (
                        <p className={`text-xs font-medium mt-1 ${cfg.color}`}>
                          {alert.type === "kpi_vence" ? "Vence: " : "Fecha: "}
                          {formatDate(alert.date)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Hallazgos críticos detalle */}
        {(activeTab === "all" || activeTab === "critico") && counts.critico > 0 && (
          <Card>
            <CardHeader title="Hallazgos Críticos Abiertos" subtitle="Requieren atención inmediata" icon={AlertTriangle} />
            <div className="space-y-3">
              {findings
                .filter((f) => f.severity === "critico" && f.status === "abierto")
                .map((f) => (
                  <div key={f.id} className="flex items-center gap-4 p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{f.title}</p>
                      <p className="text-xs text-slate-500">{f.farm_name} · {f.category} · {f.auditor}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <SeverityBadge severity={f.severity} />
                      <StatusBadge status={f.status} />
                      <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(f.visit_date)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* KPIs en retraso detalle */}
        {(activeTab === "all" || activeTab === "kpi_retraso") && counts.kpi_retraso > 0 && (
          <Card>
            <CardHeader title="KPIs en Retraso" subtitle="Planes de acción vencidos" icon={Target} />
            <div className="space-y-3">
              {kpis
                .filter((k) => k.kpi_status === "en_retraso")
                .map((k) => (
                  <div key={k.id} className="flex items-center gap-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{k.title}</p>
                      <p className="text-xs text-slate-500">{k.farm_name} · {k.responsible}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <SeverityBadge severity={k.severity} />
                      <div className="text-right">
                        <p className="text-xs font-bold text-red-600">{formatDate(k.commitment_date)}</p>
                        <p className="text-xs text-slate-400">{k.progress_pct ?? 0}% avance</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
