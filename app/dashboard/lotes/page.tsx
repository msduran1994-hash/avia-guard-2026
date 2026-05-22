import { getAllEntities } from "@/lib/base44";
import type { Lot, Farm } from "@/types";
import LotesClient from "./LotesClient";

export const revalidate = 0;

export default async function LotesPage() {
  const [lots, farms] = await Promise.all([
    getAllEntities<Lot>("Lot"),
    getAllEntities<Farm>("Farm"),
  ]);
  return <LotesClient initialLots={lots} farms={farms} />;
}
