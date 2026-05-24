import { getAllEntities } from "@/lib/local-db";
import type { Document, Farm } from "@/types";
import DocumentosClient from "./DocumentosClient";

export const revalidate = 0;

export default async function DocumentosPage() {
  const [docs, farms] = await Promise.all([
    getAllEntities<Document>("Document"),
    getAllEntities<Farm>("Farm"),
  ]);
  return <DocumentosClient initialDocs={docs} farms={farms} />;
}
