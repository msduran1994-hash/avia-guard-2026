import { getAllEntities } from "@/lib/local-db";
import type { Finding, Farm } from "@/types";
import HallazgosClient from "./HallazgosClient";

export const revalidate = 0;

export default async function HallazgosPage() {
  const [findings, farms] = await Promise.all([
    getAllEntities<Finding>("Finding"),
    getAllEntities<Farm>("Farm"),
  ]);
  return <HallazgosClient initialFindings={findings} farms={farms} />;
}
