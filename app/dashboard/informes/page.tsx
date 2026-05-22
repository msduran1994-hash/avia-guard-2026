import { getAllEntities } from "@/lib/base44";
import type { AuditReport, Farm, Finding, KPIPlan } from "@/types";
import InformesClient from "./InformesClient";

export const revalidate = 0;

export default async function InformesPage() {
  const [reports, farms, findings, kpis] = await Promise.all([
    getAllEntities<AuditReport>("AuditReport"),
    getAllEntities<Farm>("Farm"),
    getAllEntities<Finding>("Finding"),
    getAllEntities<KPIPlan>("KPIPlan"),
  ]);
  return <InformesClient reports={reports} farms={farms} findings={findings} kpis={kpis} />;
}
