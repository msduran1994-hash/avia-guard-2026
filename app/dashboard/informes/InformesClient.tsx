"use client";
import { useState } from "react";
import { BarChart3, Plus, Download, Calendar, CheckCircle2 } from "lucide-react";
import type { AuditReport, Farm, Finding, KPIPlan } from "@/types";
import Header from "@/components/layout/Header";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { postEntity } from "@/lib/api-client";
import FindingsBySeverity from "@/components/charts/FindingsBySeverity";
import FindingsByCategory from "@/components/charts/FindingsByCategory";
import KPIProgressChart from "@/components/charts/KPIProgressChart";
import FarmCapacityChart from "@/components/charts/FarmCapacityChart";

interface Props {
  reports: AuditReport[];
  farms: Farm[];
  findings: Finding[];
  kpis: KPIPlan[];
}

const REPORT_TYPES = ["mensual","trimestral","anual","especial"];

export default function InformesClient({ reports, farms, findings, kpis }: Props) {
  const [localReports, setLocalReports] = useState<AuditReport[]>(reports);
  const [viewReport, setViewReport]     = useState<AuditReport | null>(null);
  const [createOpen, setCreateOpen]     = useState(false);
  const [newTitle, setNewTitle]         = useState("");
  const [newType, setNewType]           = useState<AuditReport["report_type"]>("mensual");
  const [saving, setSaving]             = useState(false);

  const handleCreate = async () => {
    if (!newTitle) return;
    setSaving(true);
    try {
      const critFindings = findings.filter((f) => f.severity === "critico").length;
      const complianceAvg = kpis.length
        ? Math.round(kpis.reduce((s, k) => s + (k.progress_pct ?? 0), 0) / kpis.length)
        : 0;
      const created = await postEntity<AuditReport>("AuditReport", {
        title: newTitle,
        report_type: newType,
        status: "borrador",
        findings_count: findings.length,
        critical_findings: critFindings,
        compliance_avg: complianceAvg,
        generated_by: "msduran1994@gmail.com",
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
        period_end: new Date().toISOString().split("T")[0],
      });
      setLocalReports((p) => [...p, created]);
      setCreateOpen(false);
      setNewTitle("");
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Informes Ejecutivos" subtitle="Reportes de auditoría y cumplimiento"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={Download}>Exportar PDF</Button>
            <Button icon={Plus} onClick={() => setCreateOpen(true)}>Nuevo Informe</Button>
          </div>
        }
      />

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Hallazgos",  value: findings.length,                                    color: "text-slate-700",  bg: "bg-slate-50" },
            { label: "Críticos",         value: findings.filter((f) => f.severity === "critico").length, color: "text-red-700", bg: "bg-red-50" },
            { label: "KPIs Activos",     value: kpis.filter((k) => k.kpi_status !== "completado").length, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Cumplimiento %",   value: `${kpis.length ? Math.round(kpis.reduce((s,k)=>s+(k.progress_pct??0),0)/kpis.length) : 0}%`, color: "text-green-700", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-5 text-center`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Hallazgos por Severidad" icon={BarChart3} />
            <FindingsBySeverity findings={findings} />
          </Card>
          <Card>
            <CardHeader title="Hallazgos por Categoría" icon={BarChart3} />
            <FindingsByCategory findings={findings} />
          </Card>
          <Card>
            <CardHeader title="KPIs por Granja" icon={BarChart3} />
            <KPIProgressChart kpis={kpis} />
          </Card>
          <Card>
            <CardHeader title="Capacidad por Granja" icon={BarChart3} />
            <FarmCapacityChart farms={farms} />
          </Card>
        </div>

        {/* Reports list */}
        <Card>
          <CardHeader title="Informes Generados" subtitle={`${localReports.length} informes`} icon={BarChart3} />
          <div className="space-y-3">
            {localReports.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                onClick={() => setViewReport(r)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{r.title}</p>
                    <p className="text-xs text-slate-500">
                      {r.report_type} · {formatDate(r.period_start)} – {formatDate(r.period_end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r.compliance_avg !== undefined && (
                    <div className="text-center">
                      <p className={`text-lg font-bold ${r.compliance_avg >= 80 ? "text-green-600" : r.compliance_avg >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                        {r.compliance_avg}%
                      </p>
                      <p className="text-xs text-slate-400">cumplimiento</p>
                    </div>
                  )}
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
            {localReports.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No hay informes generados</p>}
          </div>
        </Card>
      </div>

      {/* View report modal */}
      {viewReport && (
        <Modal open={!!viewReport} onClose={() => setViewReport(null)} title={viewReport.title} size="xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ["Tipo", viewReport.report_type],
                ["Período", `${formatDate(viewReport.period_start)} – ${formatDate(viewReport.period_end)}`],
                ["Auditorías", viewReport.audits_count],
                ["Hallazgos", viewReport.findings_count],
                ["Críticos", viewReport.critical_findings],
                ["Cumplimiento", `${viewReport.compliance_avg ?? 0}%`],
                ["Estado", viewReport.status],
                ["Generado por", viewReport.generated_by],
              ].map(([l,v]) => (
                <div key={l as string} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-0.5">{l as string}</p>
                  <p className="font-semibold text-slate-800 text-sm">{v as string ?? "—"}</p>
                </div>
              ))}
            </div>
            {viewReport.conclusions && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-600 font-semibold mb-1">Conclusiones</p>
                <p className="text-sm text-slate-700">{viewReport.conclusions}</p>
              </div>
            )}
            {viewReport.recommendations && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-green-600 font-semibold mb-1">Recomendaciones</p>
                <p className="text-sm text-slate-700">{viewReport.recommendations}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen} onClose={() => setCreateOpen(false)}
        title="Nuevo Informe Ejecutivo" size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={saving}>Generar Informe</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Informe Ejecutivo..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={newType} onChange={(e) => setNewType(e.target.value as AuditReport["report_type"])}>
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            El informe se generará automáticamente con los datos actuales:
            <strong> {findings.length}</strong> hallazgos,
            <strong> {kpis.length}</strong> planes KPI,
            <strong> {farms.length}</strong> granjas.
          </p>
        </div>
      </Modal>
    </div>
  );
}
