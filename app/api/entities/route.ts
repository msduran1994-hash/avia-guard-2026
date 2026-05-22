import { NextRequest, NextResponse } from "next/server";
import { queryEntities, createEntity, updateEntity, deleteEntity } from "@/lib/base44";
import type { EntityName } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get("entity") as EntityName;
  const limit = parseInt(searchParams.get("limit") ?? "500");
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const sort = searchParams.get("sort") ?? undefined;
  const queryParam = searchParams.get("query");
  const query = queryParam ? JSON.parse(queryParam) : {};

  if (!entity) return NextResponse.json({ error: "entity required" }, { status: 400 });

  try {
    const data = await queryEntities(entity, { limit, skip, sort, query });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get("entity") as EntityName;
  if (!entity) return NextResponse.json({ error: "entity required" }, { status: 400 });

  const body = await req.json();
  try {
    const created = await createEntity(entity, body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get("entity") as EntityName;
  const id = searchParams.get("id");
  if (!entity || !id) return NextResponse.json({ error: "entity and id required" }, { status: 400 });

  const body = await req.json();
  try {
    const updated = await updateEntity(entity, id, body);
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get("entity") as EntityName;
  const id = searchParams.get("id");
  if (!entity || !id) return NextResponse.json({ error: "entity and id required" }, { status: 400 });

  try {
    await deleteEntity(entity, id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
