"use client";
import { useState, useMemo } from "react";
import {
  AlertTriangle, Plus, Search, Edit2, Trash2, Eye,
  Building2, Calendar, User, Tag
} from "lucide-react";
import type { Finding, Farm } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { postEntity, putEntity, deleteEntityById } from "@/lib/api-client";
import FindingsBySeverity from "@/components/charts/FindingsBySeverity";
import FindingsByCategory from "@/components/charts/FindingsByCategory";

interface Props { initialFindings: Finding[]; farms: Farm[] }

const CATEGORIES = [
  "Ambiental", "Estructural / Equipos", "Sanitario", "Mortalidad",
  "Financiero", "Operativo", "Alimento / Insumos", "Documental",
];
const SEVERITIES = ["critico", "alto", "medio", "bajo", "informativo"];
const STATUSES   = ["abierto", "en_proceso", "cerrado", "verificado"];

const EMPTY: Partial<Finding> = {
  title: "", description: "", farm_name: "", farm_type: "Propia",
  farm_operative_type: "Engorde", auditor: "", visit_date: "",
  category: "Operativo", severity: "medio", status: "abierto",
  risk_types: [], evidence_urls: [],
};

export default function HallazgosClient({ initialFindings, farms }: Props) {
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [search, setSearch]     = useState("");
  const [sevFilter, setSevFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statFilter, setStatFilter] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [viewItem, setViewItem]   = useState<Finding | null>(null);
  const [editItem, setEditItem]   = useState<Partial<Finding> | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return findings.filter((f) => {
      const matchQ = !q || f.title.toLowerCase().includes(q)
        || f.farm_name?.toLowerCase().includes(q)
        || f.auditor?.toLowerCase().includes(q)
        || f.description?.toLowerCase().includes(q);
      return matchQ
        && (!sevFilter  || f.severity === sevFilter)
        && (!catFilter  || f.category === catFilter)
        && (!statFilter || f.status   === statFilter)
        && (!farmFilter || f.farm_name === farmFilter);
    });
  }, [findings, search, sevFilter, catFilter, statFilter, farmFilter]);

  const stats = useMemo(() => ({
    total:    findings.length,
    critico:  findings.filter((f) => f.severity === "critico").length,
    alto:     findings.filter((f) => f.severity === "alto").length,
    abiertos: findings.filter((f) => f.status === "abierto").length,
    verificados: findings.filter((f) => f.status === "verificado").length,
  }), [findings]);

  const uniqueFarms = useMemo(() =>
    Array.from(new Set(findings.map((f) => f.farm_name).filter(Boolean))).sort(),
  [findings]);

  const handleSave = async () => {
    if (!editItem?.title) return;
    setSaving(true);
    try {
      if (editItem.id) {
        const updated = await putEntity<Finding>("Finding", editItem.id, editItem);
        setFindings((prev) => prev.map((f) => (f.id === editItem.id ? { ...f, ...updated } : f)));
      } else {
        const created = await postEntity<Finding>("Finding", editItem);
        setFindings((prev) => [...prev, created]);
      }
      setEditItem(null);
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntityById("Finding", deleteId);
      setFindings((prev) => prev.filter((f) => f.id !== deleteId));
      setDeleteId(null);
    } catch (e) { alert((e as Error).message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Hallazgos"
        subtitle={`${stats.total} registros · ${stats.critico} críticos · ${stats.abiertos} abiertos`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCharts((v) => !v)}>
              {showCharts ? "Ver Lista" : "Ver Gráficas"}
            </Button>
            <Button icon={Plus} onClick={() => setEditItem({ ...EMPTY })}>
              Nuevo Hallazgo
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Total",       value: stats.total,       bg: "bg-slate-50",   text: "text-slate-700" },
            { label: "Críticos",    value: stats.critico,     bg: "bg-red-50",     text: "text-red-700" },
            { label: "Altos",       value: stats.alto,        bg: "bg-orange-50",  text: "text-orange-700" },
            { label: "Abiertos",    value: stats.abiertos,    bg: "bg-yellow-50",  text: "text-yellow-700" },
            { label: "Verificados", value: stats.verificados, bg: "bg-green-50",   text: "text-green-700" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts view */}
        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-base font-semibold text-slate-800 mb-4">Por Severidad</h3>
              <FindingsBySeverity findings={filtered} />
            </Card>
            <Card>
              <h3 className="text-base font-semibold text-slate-800 mb-4">Por Categoría</h3>
              <FindingsByCategory findings={filtered} />
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <Input placeholder="Buscar hallazgo, granja, auditor…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
          </div>
          {[
            { value: sevFilter,  set: setSevFilter,  options: [["","Severidad"], ...SEVERITIES.map((s) => [s, s.charAt(0).toUpperCase() + s.slice(1)])] },
            { value: catFilter,  set: setCatFilter,  options: [["","Categoría"], ...CATEGORIES.map((c) => [c, c])] },
            { value: statFilter, set: setStatFilter, options: [["","Estado"], ...STATUSES.map((s) => [s, s.charAt(0).toUpperCase() + s.slice(1)])] },
            { value: farmFilter, set: setFarmFilter, options: [["","Granja"], ...uniqueFarms.map((f) => [f, f])] },
          ].map((sel, i) => (
            <select
              key={i}
              value={sel.value}
              onChange={(e) => sel.set(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <span className="self-center text-sm text-slate-500">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hallazgo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Granja</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Severidad</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 truncate max-w-48">{f.title}</p>
                      <p className="text-xs text-slate-500 truncate">{f.auditor}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{f.farm_name}</p>
                      <p className="text-xs text-slate-500">{f.farm_operative_type}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{f.category}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(f.visit_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewItem(f)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button onClick={() => setEditItem({ ...f })} className="p-1.5 hover:bg-blue-50 rounded-lg">
                          <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                        <button onClick={() => setDeleteId(f.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No se encontraron hallazgos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* View modal */}
      {viewItem && (
        <Modal open={!!viewItem} onClose={() => setViewItem(null)} title={viewItem.title} subtitle={`${viewItem.farm_name} · ${formatDate(viewItem.visit_date)}`} size="xl">
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <SeverityBadge severity={viewItem.severity} />
              <StatusBadge status={viewItem.status} />
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{viewItem.category}</span>
              {viewItem.risk_types?.map((r) => (
                <span key={r} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{r}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-slate-500 mb-1">Granja</p><p className="font-semibold">{viewItem.farm_name}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Tipo</p><p className="font-semibold">{viewItem.farm_type} · {viewItem.farm_operative_type}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Auditor</p><p className="font-semibold">{viewItem.auditor}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Fecha de Visita</p><p className="font-semibold">{formatDate(viewItem.visit_date)}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Responsable</p><p className="font-semibold">{viewItem.responsible ?? "—"}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Fecha Compromiso</p><p className="font-semibold">{formatDate(viewItem.commitment_date)}</p></div>
            </div>
            {viewItem.description && (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 font-medium mb-1">Descripción</p>
                <p className="text-sm text-slate-700">{viewItem.description}</p>
              </div>
            )}
            {viewItem.action_plan && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-500 font-medium mb-1">Plan de Acción</p>
                <p className="text-sm text-slate-700">{viewItem.action_plan}</p>
              </div>
            )}
            {viewItem.follow_up && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 font-medium mb-1">Seguimiento</p>
                <p className="text-sm text-slate-700">{viewItem.follow_up}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit / Create modal */}
      {editItem && (
        <Modal
          open={!!editItem} onClose={() => setEditItem(null)}
          title={editItem.id ? "Editar Hallazgo" : "Nuevo Hallazgo"}
          size="xl"
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
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.farm_id ?? ""}
                onChange={(e) => {
                  const farm = farms.find((f) => f.id === e.target.value);
                  setEditItem((p) => ({ ...p, farm_id: e.target.value, farm_name: farm?.name ?? "" }));
                }}
              >
                <option value="">Seleccionar granja</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <Input label="Auditor" value={editItem.auditor ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, auditor: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.category ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, category: e.target.value as Finding["category"] }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severidad</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.severity ?? "medio"} onChange={(e) => setEditItem((p) => ({ ...p, severity: e.target.value as Finding["severity"] }))}>
                {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.status ?? "abierto"} onChange={(e) => setEditItem((p) => ({ ...p, status: e.target.value as Finding["status"] }))}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <Input label="Fecha de Visita" type="date" value={editItem.visit_date ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, visit_date: e.target.value }))} />
            <Input label="Responsable" value={editItem.responsible ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, responsible: e.target.value }))} />
            <Input label="Fecha Compromiso" type="date" value={editItem.commitment_date ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, commitment_date: e.target.value }))} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" rows={3}
                value={editItem.description ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Acción</label>
              <textarea className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" rows={3}
                value={editItem.action_plan ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, action_plan: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Seguimiento</label>
              <textarea className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" rows={2}
                value={editItem.follow_up ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, follow_up: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Eliminar Hallazgo" message="¿Estás seguro? Esta acción no se puede deshacer."
      />
    </div>
  );
}
