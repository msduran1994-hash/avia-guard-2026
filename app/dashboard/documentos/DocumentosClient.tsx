"use client";
import { useState, useMemo } from "react";
import { FileText, Plus, Search, Edit2, Trash2, Download, Tag } from "lucide-react";
import type { Document, Farm } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { postEntity, putEntity, deleteEntityById } from "@/lib/api-client";

interface Props { initialDocs: Document[]; farms: Farm[] }

const DOC_TYPES = ["Política","Procedimiento","Evidencia","Informe","Plantilla","Otro"];
const DOC_STATUSES = ["vigente","obsoleto","borrador"];
const EMPTY: Partial<Document> = { name:"", doc_type:"Evidencia", status:"vigente", version:"1.0", tags:[] };

const DOC_ICONS: Record<string, string> = {
  "Política": "📋", "Procedimiento": "📄", "Evidencia": "📷",
  "Informe": "📊", "Plantilla": "📝", "Otro": "📁",
};

export default function DocumentosClient({ initialDocs, farms }: Props) {
  const [docs, setDocs]             = useState<Document[]>(initialDocs);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editItem, setEditItem]     = useState<Partial<Document> | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return docs.filter((d) =>
      (!q || d.name.toLowerCase().includes(q) || d.farm_name?.toLowerCase().includes(q))
      && (!typeFilter || d.doc_type === typeFilter)
    );
  }, [docs, search, typeFilter]);

  const handleSave = async () => {
    if (!editItem?.name) return;
    setSaving(true);
    try {
      if (editItem.id) {
        const u = await putEntity<Document>("Document", editItem.id, editItem);
        setDocs((p) => p.map((d) => (d.id === editItem.id ? { ...d, ...u } : d)));
      } else {
        const c = await postEntity<Document>("Document", editItem);
        setDocs((p) => [...p, c]);
      }
      setEditItem(null);
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntityById("Document", deleteId);
      setDocs((p) => p.filter((d) => d.id !== deleteId));
      setDeleteId(null);
    } catch (e) { alert((e as Error).message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Documentos" subtitle={`${docs.length} documentos en repositorio`}
        actions={<Button icon={Plus} onClick={() => setEditItem({ ...EMPTY })}>Nuevo Documento</Button>} />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <Input placeholder="Buscar documento…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Todos los tipos</option>
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <Card key={d.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {DOC_ICONS[d.doc_type] ?? "📁"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{d.name}</p>
                    <p className="text-xs text-slate-500">v{d.version} · {d.doc_type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditItem({ ...d })} className="p-1 hover:bg-slate-100 rounded">
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button onClick={() => setDeleteId(d.id)} className="p-1 hover:bg-red-50 rounded">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              {d.description && <p className="text-xs text-slate-600 mb-3 line-clamp-2">{d.description}</p>}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <StatusBadge status={d.status} />
                  {d.file_size && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{d.file_size}</span>}
                </div>
                <span>{d.farm_name ?? "General"}</span>
              </div>

              {d.tags && d.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {d.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              )}
            </Card>
          ))}
          {filtered.length === 0 && <div className="col-span-3 text-center text-slate-400 py-12">No se encontraron documentos</div>}
        </div>
      </div>

      {editItem && (
        <Modal open={!!editItem} onClose={() => setEditItem(null)}
          title={editItem.id ? "Editar Documento" : "Nuevo Documento"} size="lg"
          footer={<><Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button><Button onClick={handleSave} loading={saving}>Guardar</Button></>}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input label="Nombre *" value={editItem.name ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, name: e.target.value }))} /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.doc_type ?? "Evidencia"} onChange={(e) => setEditItem((p) => ({ ...p, doc_type: e.target.value as Document["doc_type"] }))}>
                {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.status ?? "vigente"} onChange={(e) => setEditItem((p) => ({ ...p, status: e.target.value as Document["status"] }))}>
                {DOC_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Granja</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.farm_id ?? ""} onChange={(e) => {
                  const farm = farms.find((f) => f.id === e.target.value);
                  setEditItem((p) => ({ ...p, farm_id: e.target.value, farm_name: farm?.name ?? "General" }));
                }}>
                <option value="">General</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <Input label="Versión" value={editItem.version ?? "1.0"} onChange={(e) => setEditItem((p) => ({ ...p, version: e.target.value }))} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" rows={3}
                value={editItem.description ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Eliminar Documento" message="¿Estás seguro de eliminar este documento?" />
    </div>
  );
}
