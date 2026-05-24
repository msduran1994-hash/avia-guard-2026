import { getAllEntities } from "@/lib/local-db";
import type { KPIPlan, Farm } from "@/types";
import KPIsClient from "./KPIsClient";

export const revalidate = 0;

export default async function KPIsPage() {
  const [kpis, farms] = await Promise.all([
    getAllEntities<KPIPlan>("KPIPlan"),
    getAllEntities<Farm>("Farm"),
  ]);
  return <KPIsClient initialKPIs={kpis} farms={farms} />;
}
