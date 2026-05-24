import { getAllEntities } from "@/lib/local-db";
import type { Farm, Finding, KPIPlan, Audit } from "@/types";
import DashboardClient from "./DashboardClient";

export const revalidate = 0;

export default async function DashboardPage() {
  const [farms, findings, kpis, audits] = await Promise.all([
    getAllEntities<Farm>("Farm"),
    getAllEntities<Finding>("Finding"),
    getAllEntities<KPIPlan>("KPIPlan"),
    getAllEntities<Audit>("Audit"),
  ]);

  return (
    <DashboardClient
      farms={farms}
      findings={findings}
      kpis={kpis}
      audits={audits}
    />
  );
}
