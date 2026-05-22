"use client";
import { useState, useMemo } from "react";
import { Target, Plus, Search, Edit2, Trash2, Eye, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { KPIPlan, Farm } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { postEntity, putEntity, deleteEntityById } from "@/lib/api-client";
import KPIProgressChart from "@/components/charts/KPIProgressChart";

interface Props { initialKPIs: KPIPlan[]; farms: Farm[] }

const KPI_STATUSES = ["completado", "en_curso", "en_espera", "en_retraso", "no_iniciado"];
const SEVERITIES   = ["critico", "alto", "medio", "bajo", "informativo"];

const EMPTY: Partial<KPIPlan> = {
  title: "", description: "", farm_name: "", auditor: "", responsible: "",
  commitment_date: "", severity: "medio", kpi_status: "no_iniciado",
  progress_pct: 0, risk_types: [], evidence_urls: [], notes: "",
};

export default function KPIsClient({ initialKPIs, farms }: Props) {
  const [kpis, setKPIs]           = useState<KPIPlan[]>(initialKPIs);
  const [search, setSearch]       = useState("");
  const [sevFilter, setSevFilter] = useState("");
  const [statFilter, setStatFilter] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [viewItem, setViewItem]   = useState<KPIPlan | null>(null);
  const [editItem, setEditItem]   = useState<Partial<KPIPlan> | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [showChart, setShowChart] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return kpis.filter((k) =>
      (!q || k.title.toLowerCase().includes(q) || k.farm_name?.toLowerCase().includes(q) || k.responsible?.toLowerCase().includes(q))
      && (!sevFilter  || k.severity   === sevFilter)
      && (!statFilter || k.kpi_status === statFilter)
      && (!farmFilter || k.farm_name  === farmFilter)
    );
  }, [kpis, search, sevFilter, statFilter, farmFilter]);

  const stats = useMemo(() => ({
    total:       kpis.length,
    completado:  kpis.filter((k) => k.kpi_status === "completado").length,
    en_retraso:  kpis.filter((k) => k.kpi_status === "en_retraso").length,
    en_curso:    kpis.filter((k) => k.kpi_status === "en_curso").length,
    avgProgress: kpis.length ? Math.round(kpis.reduce((s, k) => s + (k.progress_pct ?? 0), 0) / kpis.length) : 0,
  }), [kpis]);

  const uniqueFarms = useMemo(() =>
    Array.from(new Set(kpis.map((k) => k.farm_name).filter(Boolean))).sort(),
  [kpis]);

  const handleSave = async () => {
    if (!editItem?.title) return;
    setSaving(true);
    try {
      if (editItem.id) {
        const updated = await putEntity<KPIPlan>("KPIPlan", editItem.id, editItem);
        setKPIs((prev) => prev.map((k) => (k.id === editItem.id ? { ...k, ...updated } : k)));
      } else {
        const created = await postEntity<KPIPlan>("KPIPlan", editItem);
        setKPIs((prev) => [...prev, created]);
      }
      setEditItem(null);
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntityById("KPIPlan", deleteId);
      setKPIs((prev) => prev.filter((k) => k.id !== deleteId));
      setDeleteId(null);
    } catch (e) { alert((e as Error).message); }
    finally { setDeleting(false); }
  };

  const getStatusColor = (s: string) => ({
    completado:  "border-green-200 bg-green-50",
    en_retraso:  "border-red-200 bg-red-50",
    en_espera:   "border-yellow-200 bg-yellow-50",
    no_iniciado: "border-slate-200 bg-slate-50",
    en_curso:    "border-blue-200 bg-blue-50",
  }[s] ?? "border-slate-200 bg-slate-50");

  const getProgressColor = (s: string) => ({
    completado:  "bg-green-500",
    en_retraso:  "bg-red-500",
    en_espera:   "bg-yellow-500",
    no_iniciado: "bg-slate-400",
    en_curso:    "bg-blue-500",
  }[s] ?? "bg-slate-400");

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Planes de Acción KPI"
        subtitle={`${stats.total} planes · ${stats.en_retraso} en retraso · ${stats.avgProgress}% avance promedio`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowChart((v) => !v)}>
              {showChart ? "Ver Tarjetas" : "Ver Gráfica"}
            </Button>
            <Button icon={Plus} onClick={() => setEditItem({ ...EMPTY })}>Nuevo KPI</Button>
          </div>
        }
      />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Total",       value: stats.total,       icon: Target,       color: "text-slate-600",  bg: "bg-slate-100" },
            { label: "Completados", value: stats.completado,  icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-100" },
            { label: "En Curso",    value: stats.en_curso,    icon: TrendingUp,   color: "text-blue-600",   bg: "bg-blue-100" },
            { label: "En Retraso",  value: stats.en_retraso,  icon: AlertCircle,  color: "text-red-600",    bg: "bg-red-100" },
            { label: "Avance Prom", value: `${stats.avgProgress}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
          ].map((s) => (
            <Card key={s.label} padding="sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {showChart && (
          <Card>
            <h3 className="text-base font-semibold text-slate-800 mb-4">KPIs por Granja y Estado</h3>
            <KPIProgressChart kpis={filtered} />
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <Input placeholder="Buscar KPI, granja, responsable…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
          </div>
          {[
            { value: sevFilter,  set: setSevFilter,  opts: [["","Severidad"], ...SEVERITIES.map((s) => [s, s.charAt(0).toUpperCase() + s.slice(1)])] },
            { value: statFilter, set: setStatFilter, opts: [["","Estado KPI"], ...KPI_STATUSES.map((s) => [s, s.replace(/_/g," ")])] },
            { value: farmFilter, set: setFarmFilter, opts: [["","Granja"], ...uniqueFarms.map((f) => [f, f])] },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={(e) => sel.set(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
              {sel.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <span className="self-center text-sm text-slate-500">{filtered.length} resultados</span>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((k) => (
            <div key={k.id} className={`rounded-xl border p-4 ${getStatusColor(k.kpi_status)}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{k.title}</p>
                <div className="flex gap-1">
                  <button onClick={() => setViewItem(k)} className="p-1 hover:bg-white/60 rounded"><Eye className="w-3.5 h-3.5 text-slate-500" /></button>
                  <button onClick={() => setEditItem({ ...k })} className="p-1 hover:bg-white/60 rounded"><Edit2 className="w-3.5 h-3.5 text-blue-500" /></button>
                  <button onClick={() => setDeleteId(k.id)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>

              <div className="space-y-1 mb-3 text-xs text-slate-600">
                <div className="flex items-center gap-1"><Target className="w-3 h-3 text-slate-400" />{k.farm_name}</div>
                <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />Vence: {formatDate(k.commitment_date)}</div>
                {k.responsible && <div className="flex items-center gap-1"><span className="text-slate-400">👤</span>{k.responsible}</div>}
              </div>

              <div className="flex items-center justify-between mb-2">
                <SeverityBadge severity={k.severity} />
                <StatusBadge status={k.kpi_status} />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Avance</span><span>{k.progress_pct ?? 0}%</span>
                </div>
                <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressColor(k.kpi_status)}`}
                    style={{ width: `${k.progress_pct ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center text-slate-400 py-12">No se encontraron KPIs</div>
          )}
        </div>
      </div>

      {/* View modal */}
      {viewItem && (
        <Modal open={!!viewItem} onClose={() => setViewItem(null)} title={viewItem.title} subtitle={viewItem.farm_name} size="lg">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <SeverityBadge severity={viewItem.severity} />
              <StatusBadge status={viewItem.kpi_status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Granja", viewItem.farm_name],
                ["Responsable", viewItem.responsible],
                ["Auditor", viewItem.auditor],
                ["Avance", `${viewItem.progress_pct ?? 0}%`],
                ["Compromiso", formatDate(viewItem.commitment_date)],
                ["Completado", formatDate(viewItem.completion_date)],
              ].map(([l, v]) => (
                <div key={l as string}><p className="text-xs text-slate-500 mb-0.5">{l as string}</p><p className="font-semibold">{v as string ?? "—"}</p></div>
              ))}
            </div>
            {viewItem.description && <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500 mb-1">Descripción</p><p className="text-sm">{viewItem.description}</p></div>}
            {viewItem.follow_up && <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 mb-1">Seguimiento</p><p className="text-sm">{viewItem.follow_up}</p></div>}
            {viewItem.notes && <div className="bg-blue-50 rounded-lg p-3"><p className="text-xs text-blue-600 mb-1">Notas</p><p className="text-sm">{viewItem.notes}</p></div>}
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editItem && (
        <Modal open={!!editItem} onClose={() => setEditItem(null)}
          title={editItem.id ? "Editar KPI" : "Nuevo Plan KPI"} size="xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button>
              <Button onClick={handleSave} loading={saving}>Guardar</Button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Título *" value={editItem.title ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Granja</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.farm_id ?? ""} onChange={(e) => {
                  const farm = farms.find((f) => f.id === e.target.value);
                  setEditItem((p) => ({ ...p, farm_id: e.target.value, farm_name: farm?.name ?? "" }));
                }}>
                <option value="">Seleccionar granja</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <Input label="Responsable *" value={editItem.responsible ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, responsible: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severidad</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.severity ?? "medio"} onChange={(e) => setEditItem((p) => ({ ...p, severity: e.target.value as KPIPlan["severity"] }))}>
                {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado KPI</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.kpi_status ?? "no_iniciado"} onChange={(e) => setEditItem((p) => ({ ...p, kpi_status: e.target.value as KPIPlan["kpi_status"] }))}>
                {KPI_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
              </select>
            </div>
            <Input label="Fecha Compromiso" type="date" value={editItem.commitment_date ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, commitment_date: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Avance (%)</label>
              <input type="range" min="0" max="100" value={editItem.progress_pct ?? 0}
                onChange={(e) => setEditItem((p) => ({ ...p, progress_pct: +e.target.value }))}
                className="w-full" />
              <p className="text-right text-xs text-slate-500 mt-1">{editItem.progress_pct ?? 0}%</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" rows={3}
                value={editItem.description ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Seguimiento</label>
              <textarea className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" rows={3}
                value={editItem.follow_up ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, follow_up: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Eliminar KPI" message="¿Estás seguro de que deseas eliminar este plan de acción?" />
    </div>
  );
}
