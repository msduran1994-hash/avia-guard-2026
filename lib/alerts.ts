import type { Finding, KPIPlan, Audit } from "@/types";
import type { Alert } from "@/components/notifications/NotificationsPanel";

export function computeAlerts(
  findings: Finding[],
  kpis: KPIPlan[],
  audits: Audit[]
): Alert[] {
  const alerts: Alert[] = [];
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Hallazgos críticos abiertos
  findings
    .filter((f) => f.severity === "critico" && f.status === "abierto")
    .forEach((f) => {
      alerts.push({
        id: `finding-${f.id}`,
        type: "critico",
        title: f.title,
        subtitle: `${f.farm_name} · ${f.category}`,
        date: f.visit_date,
        href: "/dashboard/hallazgos",
      });
    });

  // KPIs en retraso
  kpis
    .filter((k) => k.kpi_status === "en_retraso")
    .forEach((k) => {
      alerts.push({
        id: `kpi-retraso-${k.id}`,
        type: "kpi_retraso",
        title: k.title,
        subtitle: `${k.farm_name} · ${k.responsible}`,
        date: k.commitment_date,
        href: "/dashboard/kpis",
      });
    });

  // Auditorías pendientes
  audits
    .filter((a) => a.status === "pendiente")
    .forEach((a) => {
      alerts.push({
        id: `audit-${a.id}`,
        type: "auditoria_pendiente",
        title: a.title,
        subtitle: `${a.type} · ${a.auditor ?? "Sin auditor"}`,
        date: a.scheduled_date,
        href: "/dashboard/auditorias",
      });
    });

  // KPIs próximos a vencer (7 días)
  kpis
    .filter((k) => {
      if (k.kpi_status === "completado" || k.kpi_status === "en_retraso") return false;
      if (!k.commitment_date) return false;
      const d = new Date(k.commitment_date);
      return d >= today && d <= in7Days;
    })
    .forEach((k) => {
      alerts.push({
        id: `kpi-vence-${k.id}`,
        type: "kpi_vence",
        title: k.title,
        subtitle: `${k.farm_name} · ${k.responsible}`,
        date: k.commitment_date,
        href: "/dashboard/kpis",
      });
    });

  return alerts;
}
