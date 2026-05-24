import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { EntityName } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

const ALLOWED: Set<string> = new Set([
  "Farm", "Finding", "KPIPlan", "Audit", "Document",
  "Inventory", "Lot", "AuditReport", "AllowedUser",
]);

function filePath(entity: string) {
  return path.join(DATA_DIR, `${entity}.json`);
}

function readAll(entity: string): Record<string, unknown>[] {
  try {
    return JSON.parse(fs.readFileSync(filePath(entity), "utf-8"));
  } catch {
    return [];
  }
}

function writeAll(entity: string, records: Record<string, unknown>[]) {
  fs.writeFileSync(filePath(entity), JSON.stringify(records, null, 2), "utf-8");
}

function newId(): string {
  return Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get("entity") as EntityName;
  if (!entity || !ALLOWED.has(entity))
    return NextResponse.json({ error: "invalid entity" }, { status: 400 });

  const limit = parseInt(searchParams.get("limit") ?? "500");
  const skip  = parseInt(searchParams.get("skip")  ?? "0");
  const sort  = searchParams.get("sort") ?? null;
  const queryParam = searchParams.get("query");
  const filter: Record<string, unknown> = queryParam ? JSON.parse(queryParam) : {};

  let records = readAll(entity);

  if (Object.keys(filter).length) {
    records = records.filter((r) =>
      Object.entries(filter).every(([k, v]) => r[k] === v)
    );
  }

  if (sort) {
    const desc = sort.startsWith("-");
    const key  = desc ? sort.slice(1) : sort;
    records = [...records].sort((a, b) => {
      const av = a[key] as string, bv = b[key] as string;
      return desc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });
  }

  const total = records.length;
  const paged = records.slice(skip, skip + limit);

  return NextResponse.json(
    { entities: paged, count: total },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get("entity") as EntityName;
  if (!entity || !ALLOWED.has(entity))
    return NextResponse.json({ error: "invalid entity" }, { status: 400 });

  const body = await req.json();
  const now = new Date().toISOString();
  const record = {
    ...body,
    id: newId(),
    created_date: now,
    updated_date: now,
  };

  const records = readAll(entity);
  records.push(record);
  writeAll(entity, records);

  return NextResponse.json(record, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get("entity") as EntityName;
  const id = searchParams.get("id");
  if (!entity || !ALLOWED.has(entity) || !id)
    return NextResponse.json({ error: "entity and id required" }, { status: 400 });

  const body = await req.json();
  const records = readAll(entity);
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  const updated = { ...records[idx], ...body, id, updated_date: new Date().toISOString() };
  records[idx] = updated;
  writeAll(entity, records);

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get("entity") as EntityName;
  const id = searchParams.get("id");
  if (!entity || !ALLOWED.has(entity) || !id)
    return NextResponse.json({ error: "entity and id required" }, { status: 400 });

  const records = readAll(entity);
  const next = records.filter((r) => r.id !== id);
  if (next.length === records.length)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  writeAll(entity, next);
  return NextResponse.json({ ok: true });
}
