"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "ghost";
  size?: "sm" | "md";
  className?: string;
}

const VARIANTS: Record<string, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-800",
  danger:  "bg-red-100 text-red-700",
  info:    "bg-blue-100 text-blue-700",
  ghost:   "bg-gray-100 text-gray-600",
};

export default function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center font-medium rounded-full border border-transparent",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      VARIANTS[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const MAP: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    critico:     { label: "Crítico",     variant: "danger" },
    alto:        { label: "Alto",        variant: "warning" },
    medio:       { label: "Medio",       variant: "info" },
    bajo:        { label: "Bajo",        variant: "success" },
    informativo: { label: "Informativo", variant: "ghost" },
  };
  const m = MAP[severity] ?? { label: severity, variant: "default" as const };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    abierto:     { label: "Abierto",     variant: "danger" },
    en_proceso:  { label: "En Proceso",  variant: "warning" },
    cerrado:     { label: "Cerrado",     variant: "ghost" },
    verificado:  { label: "Verificado",  variant: "success" },
    pendiente:   { label: "Pendiente",   variant: "ghost" },
    completada:  { label: "Completada",  variant: "success" },
    aprobada:    { label: "Aprobada",    variant: "info" },
    rechazada:   { label: "Rechazada",   variant: "danger" },
    en_proceso_a:{ label: "En Proceso",  variant: "warning" },
    completado:  { label: "Completado",  variant: "success" },
    en_retraso:  { label: "En Retraso",  variant: "danger" },
    en_espera:   { label: "En Espera",   variant: "warning" },
    no_iniciado: { label: "No Iniciado", variant: "ghost" },
    en_curso:    { label: "En Curso",    variant: "info" },
    activa:      { label: "Activa",      variant: "success" },
    inactiva:    { label: "Inactiva",    variant: "ghost" },
    mantenimiento:{ label: "Mantenimiento", variant: "warning" },
    vigente:     { label: "Vigente",     variant: "success" },
    obsoleto:    { label: "Obsoleto",    variant: "ghost" },
    borrador:    { label: "Borrador",    variant: "warning" },
    activo:      { label: "Activo",      variant: "success" },
    finalizado:  { label: "Finalizado",  variant: "ghost" },
    vendido:     { label: "Vendido",     variant: "info" },
  };
  const m = MAP[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
