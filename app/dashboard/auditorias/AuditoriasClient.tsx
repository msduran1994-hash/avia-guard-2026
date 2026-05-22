"use client";
import { useState, useMemo } from "react";
import { ClipboardCheck, Plus, Search, Edit2, Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import type { Audit, Farm } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { postEntity, putEntity, deleteEntityById } from "@/lib/api-client";

interface Props { initialAudits: Audit[]; farms: Farm[] }

const AUDIT_TYPES   = ["bioseguridad","bienestar","alimentacion","sanidad","general","personalizado"];
const AUDIT_STATUSES= ["pendiente","en_proceso","completada","aprobada","rechazada"];

const EMPTY: Partial<Audit> = {
  title: "", type: "general", status: "pendiente",
  auditor: "", farm_id: "", checklist: [],
};

export default function AuditoriasClient({ initialAudits, farms }: Props) {
  const [audits, setAudits]         = useState<Audit[]>(initialAudits);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewItem, setViewItem]     = useState<Audit | null>(null);
  const [editItem, setEditItem]     = useState<Partial<Audit> | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [expandChecklist, setExpandChecklist] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return audits.filter((a) =>
      (!q || a.title.toLowerCase().includes(q) || a.auditor?.toLowerCase().includes(q))
      && (!statusFilter || a.status === statusFilter)
    );
  }, [audits, search, statusFilter]);

  const getFarmName = (id?: string) => farms.find((f) => f.id === id)?.name ?? id ?? "—";

  const calcScore = (audit: Audit) => {
    if (!audit.checklist?.length) return null;
    const answered = audit.checklist.filter((c) => c.answer === "si" || c.answer === "no");
    if (!answered.length) return null;
    const yes = answered.filter((c) => c.answer === "si").length;
    return Math.round((yes / answered.length) * 100);
  };

  const handleSave = async () => {
    if (!editItem?.title) return;
    setSaving(true);
    try {
      if (editItem.id) {
        const u = await putEntity<Audit>("Audit", editItem.id, editItem);
        setAudits((prev) => prev.map((a) => (a.id === editItem.id ? { ...a, ...u } : a)));
      } else {
        const c = await postEntity<Audit>("Audit", editItem);
        setAudits((prev) => [...prev, c]);
      }
      setEditItem(null);
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntityById("Audit", deleteId);
      setAudits((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    } catch (e) { alert((e as Error).message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Auditorías"
        subtitle={`${audits.length} auditorías · ${audits.filter((a) => a.status === "en_proceso").length} en proceso`}
        actions={<Button icon={Plus} onClick={() => setEditItem({ ...EMPTY })}>Nueva Auditoría</Button>}
      />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {AUDIT_STATUSES.slice(0, 4).map((s) => (
            <div key={s} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">
                {audits.filter((a) => a.status === s).length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">{s.replace("_", " ")}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <Input placeholder="Buscar auditoría, auditor…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Todos los estados</option>
            {AUDIT_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
          </select>
          <span className="self-center text-sm text-slate-500">{filtered.length} resultados</span>
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Título","Granja","Tipo","Estado","Auditor","Fecha","Score","Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const score = calcScore(a);
                  const farmName = getFarmName(a.farm_id);
                  const isExpanded = expandChecklist === a.id;
                  return (
                    <>
                      <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{a.title}</td>
                        <td className="px-4 py-3 text-slate-600">{farmName}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 capitalize">{a.type}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3 text-slate-600">{a.auditor}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(a.scheduled_date)}</td>
                        <td className="px-4 py-3">
                          {score !== null ? (
                            <span className={`font-bold text-sm ${score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                              {score}%
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {a.checklist && a.checklist.length > 0 && (
                              <button onClick={() => setExpandChecklist(isExpanded ? null : a.id)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button onClick={() => setViewItem(a)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            <button onClick={() => setEditItem({ ...a })} className="p-1.5 hover:bg-blue-50 rounded-lg">
                              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button onClick={() => setDeleteId(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && a.checklist && (
                        <tr key={`${a.id}-checklist`}>
                          <td colSpan={8} className="px-4 pb-4 bg-slate-50">
                            <div className="rounded-lg border border-slate-200 overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-slate-100">
                                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Sección</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Pregunta</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Respuesta</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {a.checklist.map((item) => (
                                    <tr key={item.id} className="border-t border-slate-100">
                                      <td className="px-3 py-2 text-slate-500">{item.section}</td>
                                      <td className="px-3 py-2 text-slate-700">{item.question}</td>
                                      <td className="px-3 py-2">
                                        <span className={`font-semibold capitalize ${
                                          item.answer === "si" ? "text-green-600" :
                                          item.answer === "no" ? "text-red-600" :
                                          item.answer === "na" ? "text-slate-400" : "text-yellow-600"
                                        }`}>{item.answer}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No se encontraron auditorías</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit modal */}
      {editItem && (
        <Modal open={!!editItem} onClose={() => setEditItem(null)}
          title={editItem.id ? "Editar Auditoría" : "Nueva Auditoría"} size="lg"
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
                value={editItem.farm_id ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, farm_id: e.target.value }))}>
                <option value="">Seleccionar granja</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <Input label="Auditor" value={editItem.auditor ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, auditor: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.type ?? "general"} onChange={(e) => setEditItem((p) => ({ ...p, type: e.target.value as Audit["type"] }))}>
                {AUDIT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.status ?? "pendiente"} onChange={(e) => setEditItem((p) => ({ ...p, status: e.target.value as Audit["status"] }))}>
                {AUDIT_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>
            <Input label="Fecha Programada" type="date" value={editItem.scheduled_date ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, scheduled_date: e.target.value }))} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Resumen</label>
              <textarea className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" rows={3}
                value={editItem.summary ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, summary: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Eliminar Auditoría" message="¿Estás seguro de eliminar esta auditoría?" />
    </div>
  );
}
