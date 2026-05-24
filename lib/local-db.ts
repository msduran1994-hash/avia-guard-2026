import farmData from "@/data/Farm.json";
import findingData from "@/data/Finding.json";
import kpiData from "@/data/KPIPlan.json";
import auditData from "@/data/Audit.json";
import documentData from "@/data/Document.json";
import inventoryData from "@/data/Inventory.json";
import lotData from "@/data/Lot.json";
import auditReportData from "@/data/AuditReport.json";
import allowedUserData from "@/data/AllowedUser.json";

const DB: Record<string, unknown[]> = {
  Farm: farmData as unknown[],
  Finding: findingData as unknown[],
  KPIPlan: kpiData as unknown[],
  Audit: auditData as unknown[],
  Document: documentData as unknown[],
  Inventory: inventoryData as unknown[],
  Lot: lotData as unknown[],
  AuditReport: auditReportData as unknown[],
  AllowedUser: allowedUserData as unknown[],
};

export function getAllEntities<T>(entityName: string): T[] {
  return (DB[entityName] ?? []) as T[];
}
