import { getAllEntities } from "@/lib/local-db";
import type { Finding, KPIPlan, Audit } from "@/types";
import NotificacionesClient from "./NotificacionesClient";

export const revalidate = 0;

export default async function NotificacionesPage() {
  const [findings, kpis, audits] = await Promise.all([
    getAllEntities<Finding>("Finding"),
    getAllEntities<KPIPlan>("KPIPlan"),
    getAllEntities<Audit>("Audit"),
  ]);
  return <NotificacionesClient findings={findings} kpis={kpis} audits={audits} />;
}
