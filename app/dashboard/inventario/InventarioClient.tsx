"use client";
import { useState, useMemo } from "react";
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle } from "lucide-react";
import type { Inventory, Farm } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate, formatNumber } from "@/lib/utils";
import { postEntity, putEntity, deleteEntityById } from "@/lib/api-client";

interface Props { initialInventory: Inventory[]; farms: Farm[] }

const CATEGORIES = ["alimento","medicina","insumo","equipo","otro"];
const EMPTY: Partial<Inventory> = { name:"", category:"alimento", unit:"", quantity:0, min_stock:0, unit_cost:0, farm_id:"" };

export default function InventarioClient({ initialInventory, farms }: Props) {
  const [items, setItems]   = useState<Inventory[]>(initialInventory);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [editItem, setEditItem]   = useState<Partial<Inventory> | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const filtered = useMemo(() => items.filter((i) => {
    const q = search.toLowerCase();
    return (!q || i.name.toLowerCase().includes(q)) && (!catFilter || i.category === catFilter);
  }), [items, search, catFilter]);

  const getFarmName = (id: string) => farms.find((f) => f.id === id)?.name ?? id ?? "—";

  const handleSave = async () => {
    if (!editItem?.name) return;
    setSaving(true);
    try {
      if (editItem.id) {
        const u = await putEntity<Inventory>("Inventory", editItem.id, editItem);
        setItems((p) => p.map((i) => (i.id === editItem.id ? { ...i, ...u } : i)));
      } else {
        const c = await postEntity<Inventory>("Inventory", editItem);
        setItems((p) => [...p, c]);
      }
      setEditItem(null);
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntityById("Inventory", deleteId);
      setItems((p) => p.filter((i) => i.id !== deleteId));
      setDeleteId(null);
    } catch (e) { alert((e as Error).message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Inventario" subtitle={`${items.length} ítems registrados`}
        actions={<Button icon={Plus} onClick={() => setEditItem({ ...EMPTY })}>Nuevo Ítem</Button>} />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <Input placeholder="Buscar ítem…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Ítem","Granja","Categoría","Cantidad","Mín Stock","Costo Unit.","Proveedor","Vence","Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const lowStock = (i.quantity ?? 0) <= (i.min_stock ?? 0);
                  return (
                    <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 flex items-center gap-1">
                          {lowStock && <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />}
                          {i.name}
                        </p>
                        <p className="text-xs text-slate-500">{i.sku} · {i.location}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{getFarmName(i.farm_id)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">{i.category}</span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${lowStock ? "text-orange-600" : "text-slate-800"}`}>
                        {formatNumber(i.quantity)} {i.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatNumber(i.min_stock)}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">${formatNumber(i.unit_cost)}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{i.supplier}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(i.expiry_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setEditItem({ ...i })} className="p-1.5 hover:bg-blue-50 rounded-lg">
                            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button onClick={() => setDeleteId(i.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">No hay ítems de inventario</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {editItem && (
        <Modal open={!!editItem} onClose={() => setEditItem(null)}
          title={editItem.id ? "Editar Ítem" : "Nuevo Ítem"} size="lg"
          footer={<><Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button><Button onClick={handleSave} loading={saving}>Guardar</Button></>}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input label="Nombre *" value={editItem.name ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, name: e.target.value }))} /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Granja</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.farm_id ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, farm_id: e.target.value }))}>
                <option value="">Seleccionar</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.category ?? "alimento"} onChange={(e) => setEditItem((p) => ({ ...p, category: e.target.value as Inventory["category"] }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <Input label="SKU" value={editItem.sku ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, sku: e.target.value }))} />
            <Input label="Unidad" value={editItem.unit ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, unit: e.target.value }))} />
            <Input label="Cantidad" type="number" value={editItem.quantity ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, quantity: +e.target.value }))} />
            <Input label="Stock Mínimo" type="number" value={editItem.min_stock ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, min_stock: +e.target.value }))} />
            <Input label="Costo Unitario" type="number" value={editItem.unit_cost ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, unit_cost: +e.target.value }))} />
            <Input label="Proveedor" value={editItem.supplier ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, supplier: e.target.value }))} />
            <Input label="Vencimiento" type="date" value={editItem.expiry_date ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, expiry_date: e.target.value }))} />
            <Input label="Ubicación" value={editItem.location ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, location: e.target.value }))} />
          </div>
        </Modal>
      )}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Eliminar Ítem" message="¿Estás seguro de eliminar este ítem del inventario?" />
    </div>
  );
}
