import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatNumber(n?: number | null): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString("es-CO");
}

export const SEVERITY_COLORS: Record<string, string> = {
  critico:     "bg-red-100 text-red-800 border-red-200",
  alto:        "bg-orange-100 text-orange-800 border-orange-200",
  medio:       "bg-yellow-100 text-yellow-800 border-yellow-200",
  bajo:        "bg-green-100 text-green-800 border-green-200",
  informativo: "bg-blue-100 text-blue-800 border-blue-200",
};

export const SEVERITY_DOT: Record<string, string> = {
  critico:     "bg-red-500",
  alto:        "bg-orange-500",
  medio:       "bg-yellow-500",
  bajo:        "bg-green-500",
  informativo: "bg-blue-500",
};

export const STATUS_COLORS: Record<string, string> = {
  abierto:    "bg-red-100 text-red-700",
  en_proceso: "bg-yellow-100 text-yellow-700",
  cerrado:    "bg-gray-100 text-gray-600",
  verificado: "bg-green-100 text-green-700",
  pendiente:  "bg-slate-100 text-slate-600",
  completada: "bg-green-100 text-green-700",
  aprobada:   "bg-blue-100 text-blue-700",
  rechazada:  "bg-red-100 text-red-700",
};

export const KPI_STATUS_COLORS: Record<string, string> = {
  completado:  "bg-green-100 text-green-700",
  en_retraso:  "bg-red-100 text-red-700",
  en_espera:   "bg-yellow-100 text-yellow-700",
  no_iniciado: "bg-gray-100 text-gray-600",
  en_curso:    "bg-blue-100 text-blue-700",
};

export const SEVERITY_CHART_COLORS: Record<string, string> = {
  critico:     "#ef4444",
  alto:        "#f97316",
  medio:       "#eab308",
  bajo:        "#22c55e",
  informativo: "#3b82f6",
};

export const CATEGORY_COLORS: string[] = [
  "#3b82f6", "#f97316", "#ef4444", "#22c55e",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b",
];

export function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export const ROLE_LABELS: Record<string, string> = {
  admin:    "Administrador",
  auditor:  "Auditor",
  operador: "Operador",
  gerencia: "Gerencia",
  user:     "Usuario",
};
