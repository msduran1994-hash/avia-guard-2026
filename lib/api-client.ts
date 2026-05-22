"use client";
import type { EntityName } from "@/types";

const endpoint = "/api/entities";

export async function fetchEntities<T>(
  entity: EntityName,
  params: { limit?: number; skip?: number; sort?: string; query?: Record<string, unknown> } = {}
): Promise<{ entities: T[]; count: number }> {
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set("entity", entity);
  if (params.limit)  url.searchParams.set("limit", String(params.limit));
  if (params.skip)   url.searchParams.set("skip",  String(params.skip));
  if (params.sort)   url.searchParams.set("sort",  params.sort);
  if (params.query)  url.searchParams.set("query", JSON.stringify(params.query));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function postEntity<T>(entity: EntityName, data: Partial<T>): Promise<T> {
  const url = `${endpoint}?entity=${entity}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? `API error ${res.status}`);
  }
  return res.json();
}

export async function putEntity<T>(entity: EntityName, id: string, data: Partial<T>): Promise<T> {
  const url = `${endpoint}?entity=${entity}&id=${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? `API error ${res.status}`);
  }
  return res.json();
}

export async function deleteEntityById(entity: EntityName, id: string): Promise<void> {
  const url = `${endpoint}?entity=${entity}&id=${id}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? `API error ${res.status}`);
  }
}
