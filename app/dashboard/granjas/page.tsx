import { getAllEntities } from "@/lib/local-db";
import type { Farm } from "@/types";
import GranjasClient from "./GranjasClient";

export const revalidate = 0;

export default async function GranjasPage() {
  const farms = await getAllEntities<Farm>("Farm");
  return <GranjasClient initialFarms={farms} />;
}
