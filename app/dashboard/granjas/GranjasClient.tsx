"use client";
import { useState, useMemo } from "react";
import {
  Building2, Plus, Search, MapPin, Users,
  Bird, Edit2, Trash2, Filter, Eye
} from "lucide-react";
import type { Farm } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatNumber, SEVERITY_COLORS } from "@/lib/utils";
import { postEntity, putEntity, deleteEntityById } from "@/lib/api-client";

interface Props { initialFarms: Farm[] }

const REGION_OPTIONS = [
  { value: "", label: "Todas las regiones" },
  { value: "Meta", label: "Meta" },
  { value: "Cundinamarca", label: "Cundinamarca" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "activa", label: "Activa" },
  { value: "inactiva", label: "Inactiva" },
  { value: "mantenimiento", label: "Mantenimiento" },
];

const RISK_COLORS: Record<string, string> = {
  critico: "bg-red-500",
  alto:    "bg-orange-500",
  medio:   "bg-yellow-500",
  bajo:    "bg-green-500",
};

const EMPTY_FARM: Partial<Farm> = {
  name: "", location: "", region: "Cundinamarca", manager: "", phone: "",
  farm_type: "Propia", operative_type: "Engorde",
  capacity: 0, barns_count: 0, status: "activa", risk_level: "bajo",
};

export default function GranjasClient({ initialFarms }: Props) {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewFarm, setViewFarm] = useState<Farm | null>(null);
  const [editFarm, setEditFarm] = useState<Partial<Farm> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return farms.filter((f) => {
      const q = search.toLowerCase();
      const matchSearch = !q || f.name.toLowerCase().includes(q)
        || f.location?.toLowerCase().includes(q)
        || f.manager?.toLowerCase().includes(q);
      const matchRegion = !regionFilter || f.region === regionFilter;
      const matchStatus = !statusFilter || f.status === statusFilter;
      return matchSearch && matchRegion && matchStatus;
    });
  }, [farms, search, regionFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: farms.length,
    active: farms.filter((f) => f.status === "activa").length,
    totalCapacity: farms.reduce((s, f) => s + (f.capacity ?? 0), 0),
    regions: Array.from(new Set(farms.map((f) => f.region).filter(Boolean))).length,
  }), [farms]);

  const handleSave = async () => {
    if (!editFarm?.name) return;
    setSaving(true);
    try {
      if (editFarm.id) {
        const updated = await putEntity<Farm>("Farm", editFarm.id, editFarm);
        setFarms((prev) => prev.map((f) => (f.id === editFarm.id ? { ...f, ...updated } : f)));
      } else {
        const created = await postEntity<Farm>("Farm", editFarm);
        setFarms((prev) => [...prev, created]);
      }
      setEditFarm(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntityById("Farm", deleteId);
      setFarms((prev) => prev.filter((f) => f.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Granjas"
        subtitle={`${stats.active} activas de ${stats.total} totales · ${Math.round(stats.totalCapacity / 1000)}K aves`}
        actions={
          <Button icon={Plus} onClick={() => setEditFarm({ ...EMPTY_FARM })}>
            Nueva Granja
          </Button>
        }
      />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Granjas",    value: stats.total,                         color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Granjas Activas",  value: stats.active,                        color: "text-green-600",  bg: "bg-green-50" },
            { label: "Capacidad Total",  value: `${Math.round(stats.totalCapacity / 1000)}K aves`, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Regiones",         value: stats.regions,                       color: "text-purple-600", bg: "bg-purple-50" },
          ].map((s) => (
            <Card key={s.label} padding="sm">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${s.bg} mb-2`}>
                <Building2 className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Buscar por nombre, ubicación o responsable…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {REGION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="self-center text-sm text-slate-500">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((farm) => (
            <Card key={farm.id} hover className="group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 leading-tight">{farm.name}</h3>
                    <p className="text-xs text-slate-500">{farm.operative_type ?? "—"} · {farm.farm_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setViewFarm(farm)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button onClick={() => setEditFarm({ ...farm })} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button onClick={() => setDeleteId(farm.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{farm.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{farm.manager}</span>
                  {farm.phone && <span className="text-slate-400">· {farm.phone}</span>}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Bird className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{formatNumber(farm.capacity)} aves · {farm.barns_count} galpones</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <StatusBadge status={farm.status ?? "activa"} />
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${RISK_COLORS[farm.risk_level ?? "bajo"]}`} />
                  <span className="text-xs text-slate-500 capitalize">{farm.risk_level ?? "bajo"}</span>
                  <span className="text-xs text-slate-400 ml-2 bg-slate-100 px-1.5 py-0.5 rounded">{farm.region}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* View Modal */}
      {viewFarm && (
        <Modal open={!!viewFarm} onClose={() => setViewFarm(null)} title={viewFarm.name} subtitle={viewFarm.location} size="lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Región", viewFarm.region],
              ["Tipo de Granja", viewFarm.farm_type],
              ["Tipo Operativo", viewFarm.operative_type],
              ["Capacidad", `${formatNumber(viewFarm.capacity)} aves`],
              ["Galpones", viewFarm.barns_count],
              ["Responsable", viewFarm.manager],
              ["Teléfono", viewFarm.phone],
              ["Estado", viewFarm.status],
              ["Nivel de Riesgo", viewFarm.risk_level],
              ["Estado Sanitario", viewFarm.sanitary_status],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-slate-500 font-medium mb-0.5">{label as string}</p>
                <p className="font-semibold text-slate-800">{value as string ?? "—"}</p>
              </div>
            ))}
          </div>
          {viewFarm.notes && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium mb-1">Notas</p>
              <p className="text-sm text-slate-700">{viewFarm.notes}</p>
            </div>
          )}
        </Modal>
      )}

      {/* Edit / Create Modal */}
      {editFarm && (
        <Modal
          open={!!editFarm}
          onClose={() => setEditFarm(null)}
          title={editFarm.id ? "Editar Granja" : "Nueva Granja"}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setEditFarm(null)}>Cancelar</Button>
              <Button onClick={handleSave} loading={saving}>Guardar</Button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Nombre *" value={editFarm.name ?? ""} onChange={(e) => setEditFarm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <Input label="Ubicación" value={editFarm.location ?? ""} onChange={(e) => setEditFarm((p) => ({ ...p, location: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Región</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editFarm.region ?? ""}
                onChange={(e) => setEditFarm((p) => ({ ...p, region: e.target.value }))}
              >
                <option value="Cundinamarca">Cundinamarca</option>
                <option value="Meta">Meta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <Input label="Responsable" value={editFarm.manager ?? ""} onChange={(e) => setEditFarm((p) => ({ ...p, manager: e.target.value }))} />
            <Input label="Teléfono" value={editFarm.phone ?? ""} onChange={(e) => setEditFarm((p) => ({ ...p, phone: e.target.value }))} />
            <Input label="Capacidad (aves)" type="number" value={editFarm.capacity ?? ""} onChange={(e) => setEditFarm((p) => ({ ...p, capacity: +e.target.value }))} />
            <Input label="# Galpones" type="number" value={editFarm.barns_count ?? ""} onChange={(e) => setEditFarm((p) => ({ ...p, barns_count: +e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Granja</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editFarm.farm_type ?? ""}
                onChange={(e) => setEditFarm((p) => ({ ...p, farm_type: e.target.value as Farm["farm_type"] }))}
              >
                <option value="Propia">Propia</option>
                <option value="Arrendada">Arrendada</option>
                <option value="Integrada">Integrada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Operativo</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editFarm.operative_type ?? ""}
                onChange={(e) => setEditFarm((p) => ({ ...p, operative_type: e.target.value as Farm["operative_type"] }))}
              >
                <option value="Engorde">Engorde</option>
                <option value="Reproductora">Reproductora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editFarm.status ?? "activa"}
                onChange={(e) => setEditFarm((p) => ({ ...p, status: e.target.value as Farm["status"] }))}
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Riesgo</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editFarm.risk_level ?? "bajo"}
                onChange={(e) => setEditFarm((p) => ({ ...p, risk_level: e.target.value as Farm["risk_level"] }))}
              >
                <option value="critico">Crítico</option>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar Granja"
        message="¿Estás seguro de que deseas eliminar esta granja? Esta acción no se puede deshacer."
      />
    </div>
  );
}
