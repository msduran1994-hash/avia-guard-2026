import { getAllEntities } from "@/lib/local-db";
import type { Audit, Farm } from "@/types";
import AuditoriasClient from "./AuditoriasClient";

export const revalidate = 0;

export default async function AuditoriasPage() {
  const [audits, farms] = await Promise.all([
    getAllEntities<Audit>("Audit"),
    getAllEntities<Farm>("Farm"),
  ]);
  return <AuditoriasClient initialAudits={audits} farms={farms} />;
}
