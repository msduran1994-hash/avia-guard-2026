"use client";
import { useState } from "react";
import { Users, Plus, Edit2, Trash2, Shield, Eye } from "lucide-react";
import type { AllowedUser } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate, getInitials, ROLE_LABELS } from "@/lib/utils";
import { postEntity, putEntity, deleteEntityById } from "@/lib/api-client";

interface Props { initialUsers: AllowedUser[] }

const ROLES = ["admin","auditor","operador","gerencia"];
const ROLE_COLORS: Record<string, string> = {
  admin:    "bg-red-100 text-red-700",
  auditor:  "bg-blue-100 text-blue-700",
  operador: "bg-green-100 text-green-700",
  gerencia: "bg-purple-100 text-purple-700",
};
const EMPTY: Partial<AllowedUser> = { email:"", full_name:"", role:"auditor", is_active:true, notes:"" };

export default function UsuariosClient({ initialUsers }: Props) {
  const [users, setUsers]       = useState<AllowedUser[]>(initialUsers);
  const [editItem, setEditItem] = useState<Partial<AllowedUser> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editItem?.email) return;
    setSaving(true);
    try {
      if (editItem.id) {
        const u = await putEntity<AllowedUser>("AllowedUser", editItem.id, editItem);
        setUsers((p) => p.map((usr) => (usr.id === editItem.id ? { ...usr, ...u } : usr)));
      } else {
        const c = await postEntity<AllowedUser>("AllowedUser", editItem);
        setUsers((p) => [...p, c]);
      }
      setEditItem(null);
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntityById("AllowedUser", deleteId);
      setUsers((p) => p.filter((u) => u.id !== deleteId));
      setDeleteId(null);
    } catch (e) { alert((e as Error).message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Usuarios" subtitle={`${users.length} usuarios · ${users.filter((u) => u.is_active).length} activos`}
        actions={<Button icon={Plus} onClick={() => setEditItem({ ...EMPTY })}>Nuevo Usuario</Button>} />

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Role distribution */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ROLES.map((role) => {
            const count = users.filter((u) => u.role === role).length;
            return (
              <div key={role} className={`rounded-xl p-4 ${ROLE_COLORS[role]} border border-transparent`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium">{ROLE_LABELS[role]}</p>
              </div>
            );
          })}
        </div>

        {/* User cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((u) => (
            <Card key={u.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${ROLE_COLORS[u.role]}`}>
                    {getInitials(u.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{u.full_name ?? "Sin nombre"}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditItem({ ...u })} className="p-1 hover:bg-slate-100 rounded">
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button onClick={() => setDeleteId(u.id)} className="p-1 hover:bg-red-50 rounded">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${u.is_active ? "bg-green-500" : "bg-slate-400"}`} />
                  <span className="text-xs text-slate-500">{u.is_active ? "Activo" : "Inactivo"}</span>
                </div>
              </div>

              {u.notes && <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1">{u.notes}</p>}
              {u.authorized_by && (
                <p className="mt-1 text-xs text-slate-400">Autorizado por: {u.authorized_by}</p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {editItem && (
        <Modal open={!!editItem} onClose={() => setEditItem(null)}
          title={editItem.id ? "Editar Usuario" : "Nuevo Usuario"} size="md"
          footer={<><Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button><Button onClick={handleSave} loading={saving}>Guardar</Button></>}>
          <div className="space-y-4">
            <Input label="Email *" type="email" value={editItem.email ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, email: e.target.value }))} />
            <Input label="Nombre Completo" value={editItem.full_name ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, full_name: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.role ?? "auditor"} onChange={(e) => setEditItem((p) => ({ ...p, role: e.target.value as AllowedUser["role"] }))}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editItem.is_active ? "true" : "false"} onChange={(e) => setEditItem((p) => ({ ...p, is_active: e.target.value === "true" }))}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <Input label="Notas" value={editItem.notes ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, notes: e.target.value }))} />
          </div>
        </Modal>
      )}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Eliminar Usuario" message="¿Estás seguro de eliminar este usuario del sistema?" />
    </div>
  );
}
