import { getAllEntities } from "@/lib/local-db";
import type { Inventory, Farm } from "@/types";
import InventarioClient from "./InventarioClient";

export const revalidate = 0;

export default async function InventarioPage() {
  const [inventory, farms] = await Promise.all([
    getAllEntities<Inventory>("Inventory"),
    getAllEntities<Farm>("Farm"),
  ]);
  return <InventarioClient initialInventory={inventory} farms={farms} />;
}
