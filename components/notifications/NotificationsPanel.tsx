"use client";
import { useEffect, useRef } from "react";
import { X, AlertTriangle, Target, ClipboardCheck, Clock, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export interface Alert {
  id: string;
  type: "critico" | "kpi_retraso" | "auditoria_pendiente" | "kpi_vence";
  title: string;
  subtitle: string;
  date?: string;
  href: string;
}

interface Props {
  alerts: Alert[];
  onClose: () => void;
}

const TYPE_CONFIG = {
  critico:            { icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-50",    border: "border-red-100",    label: "Hallazgo Crítico" },
  kpi_retraso:        { icon: Target,        color: "text-orange-500",  bg: "bg-orange-50",  border: "border-orange-100", label: "KPI en Retraso" },
  auditoria_pendiente:{ icon: ClipboardCheck,color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-100",   label: "Auditoría Pendiente" },
  kpi_vence:          { icon: Clock,         color: "text-yellow-600",  bg: "bg-yellow-50",  border: "border-yellow-100", label: "KPI Próximo a Vencer" },
};

export default function NotificationsPanel({ alerts, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const grouped = alerts.reduce<Record<string, Alert[]>>((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {});

  const order: Alert["type"][] = ["critico", "kpi_retraso", "auditoria_pendiente", "kpi_vence"];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800">Notificaciones</h3>
          <p className="text-xs text-slate-500">{alerts.length} alertas activas</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Alerts */}
      <div className="max-h-[420px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm">Sin alertas activas</p>
          </div>
        ) : (
          order.map((type) => {
            const items = grouped[type];
            if (!items?.length) return null;
            const cfg = TYPE_CONFIG[type];
            return (
              <div key={type}>
                <div className={`px-5 py-2 ${cfg.bg} border-b ${cfg.border}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>
                    {cfg.label} ({items.length})
                  </p>
                </div>
                {items.slice(0, 5).map((alert) => (
                  <Link
                    key={alert.id}
                    href={alert.href}
                    onClick={onClose}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50"
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.bg} flex-shrink-0`}>
                      <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{alert.title}</p>
                      <p className="text-xs text-slate-500 truncate">{alert.subtitle}</p>
                      {alert.date && (
                        <p className={`text-xs mt-0.5 font-medium ${cfg.color}`}>{formatDate(alert.date)}</p>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-1" />
                  </Link>
                ))}
                {items.length > 5 && (
                  <div className={`px-5 py-2 ${cfg.bg}`}>
                    <p className={`text-xs ${cfg.color}`}>+{items.length - 5} más</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
        <Link
          href="/dashboard/notificaciones"
          onClick={onClose}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Ver todas las notificaciones →
        </Link>
      </div>
    </div>
  );
}
