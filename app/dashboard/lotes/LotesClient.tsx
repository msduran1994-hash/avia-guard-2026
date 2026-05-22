"use client";
import { useState, useMemo } from "react";
import { Layers, Plus, Search, Edit2, Trash2 } from "lucide-react";
import type { Lot, Farm } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate, formatNumber } from "@/lib/utils";
import { postEntity, putEntity, deleteEntityById } from "@/lib/api-client";

interface Props { initialLots: Lot[]; farms: Farm[] }

const LOT_TYPES    = ["engorde","ponedoras","reproductoras"];
const LOT_STATUSES = ["activo","finalizado","vendido"];
const EMPTY: Partial<Lot> = { code:"", type:"engorde", status:"activo", farm_id:"", breed:"", supplier:"", quantity_in:0, quantity_current:0, weight_target:0 };

export default function LotesClient({ initialLots, farms }: Props) {
  const [lots, setLots]             = useState<Lot[]>(initialLots);
  const [search, setSearch]         = useState("");
  const [editItem, setEditItem]     = useState<Partial<Lot> | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lots.filter((l) => !q || l.code.toLowerCase().includes(q) || l.breed?.toLowerCase().includes(q));
  }, [lots, search]);

  const getFarmName = (id: string) => farms.find((f) => f.id === id)?.name ?? "—";

  const handleSave = async () => {
    if (!editItem?.code) return;
    setSaving(true);
    try {
      if (editItem.id) {
        const u = await putEntity<Lot>("Lot", editItem.id, editItem);
        setLots((p) => p.map((l) => (l.id === editItem.id ? { ...l, ...u } : l)));
      } else {
        const c = await postEntity<Lot>("Lot", editItem);
        setLots((p) => [...p, c]);
      }
      setEditItem(null);
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntityById("Lot", deleteId);
      setLots((p) => p.filter((l) => l.id !== deleteId));
      setDeleteId(null);
    } catch (e) { alert((e as Error).message); }
    finally { setDeleting(false); }
  };

  const mortalityPct = (l: Lot) => {
    if (!l.quantity_in) return null;
    const pct = ((l.quantity_in - (l.quantity_current ?? l.quantity_in)) / l.quantity_in) * 100;
    return pct.toFixed(1);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Lotes" subtitle={`${lots.length} lotes · ${lots.filter((l) => l.status === "activo").length} activos`}
        actions={<Button icon={Plus} onClick={() => setEditItem({ ...EMPTY })}>Nuevo Lote</Button>} />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        <div className="flex gap-3">
          <div className="flex-1"><Input placeholder="Buscar por código o raza…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((l) => {
            const mort = mortalityPct(l);
            const mortalityHigh = mort !== null && parseFloat(mort) > 3;
            return (
              <Card key={l.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">#{l.code}</p>
                    <p className="text-xs text-slate-500">{l.type} · {l.breed}</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <StatusBadge status={l.status} />
                    <button onClick={() => setEditItem({ ...l })} className="p-1 hover:bg-slate-100 rounded">
                      <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button onClick={() => setDeleteId(l.id)} className="p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-500">Granja</p>
                    <p className="font-semibold text-slate-700 truncate">{getFarmName(l.farm_id)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-500">Proveedor</p>
                    <p className="font-semibold text-slate-700 truncate">{l.supplier ?? "—"}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-blue-500">Aves Ingreso</p>
                    <p className="font-bold text-blue-700">{formatNumber(l.quantity_in)}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${mortalityHigh ? "bg-red-50" : "bg-green-50"}`}>
                    <p className={mortalityHigh ? "text-red-500" : "text-green-500"}>Mortalidad</p>
                    <p className={`font-bold ${mortalityHigh ? "text-red-700" : "text-green-700"}`}>{mort !== null ? `${mort}%` : "—"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-500">Peso Objetivo</p>
                    <p className="font-semibold text-slate-700">{l.weight_target ? `${l.weight_target} kg` : "—"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-500">Salida Esperada</p>
                    <p className="font-semibold text-slate-700">{formatDate(l.expected_exit)}</p>
                  </div>
                </div>

                {l.notes && <p className="mt-3 text-xs text-slate-500 bg-yellow-50 rounded-lg px-3 py-2">{l.notes}</p>}
              </Card>
            );
          })}
          {filtered.length === 0 && <div className="col-span-3 text-center text-slate-400 py-12">No hay lotes registrados</div>}
        </div>
      </div>

      {editItem && (
        <Modal open={!!editItem} onClose={() => setEditItem(null)}
          title={editItem.id ? "Editar Lote" : "Nuevo Lote"} size="lg"
          footer={<><Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button><Button onClick={handleSave} loading={saving}>Guardar</Button></>}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Código *" value={editItem.code ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, code: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Granja</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.farm_id ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, farm_id: e.target.value }))}>
                <option value="">Seleccionar</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <Input label="Raza" value={editItem.breed ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, breed: e.target.value }))} />
            <Input label="Proveedor" value={editItem.supplier ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, supplier: e.target.value }))} />
            <Input label="Aves Ingreso" type="number" value={editItem.quantity_in ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, quantity_in: +e.target.value }))} />
            <Input label="Aves Actuales" type="number" value={editItem.quantity_current ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, quantity_current: +e.target.value }))} />
            <Input label="Peso Objetivo (kg)" type="number" value={editItem.weight_target ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, weight_target: +e.target.value }))} />
            <Input label="Fecha Ingreso" type="date" value={editItem.entry_date ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, entry_date: e.target.value }))} />
            <Input label="Salida Esperada" type="date" value={editItem.expected_exit ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, expected_exit: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.status ?? "activo"} onChange={(e) => setEditItem((p) => ({ ...p, status: e.target.value as Lot["status"] }))}>
                {LOT_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Eliminar Lote" message="¿Estás seguro de eliminar este lote?" />
    </div>
  );
}
