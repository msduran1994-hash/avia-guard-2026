import type { EntityName, Base44Response } from "@/types";

const BASE44_APP_ID = process.env.BASE44_APP_ID || "6a0a53866b4d272c3b1d474a";
const BASE44_API_KEY = process.env.BASE44_API_KEY || "99f9b17091134957a7d92a852b5fc7f5";
const BASE44_API_URL = "https://api.base44.com/v1";

const headers = {
  "Content-Type": "application/json",
  "api_key": BASE44_API_KEY,
};

const base = `${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities`;

export async function queryEntities<T>(
  entity: EntityName,
  params: {
    query?: Record<string, unknown>;
    limit?: number;
    skip?: number;
    sort?: string;
    fields?: string[];
  } = {}
): Promise<Base44Response<T>> {
  const url = new URL(`${base}/${entity}`);
  if (params.limit !== undefined) url.searchParams.set("limit", String(params.limit));
  if (params.skip !== undefined) url.searchParams.set("skip", String(params.skip));
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.fields) url.searchParams.set("fields", params.fields.join(","));
  if (params.query && Object.keys(params.query).length > 0) {
    url.searchParams.set("query", JSON.stringify(params.query));
  }

  const res = await fetch(url.toString(), { headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Base44 API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createEntity<T>(entity: EntityName, data: Partial<T>): Promise<T> {
  const res = await fetch(`${base}/${entity}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Base44 API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function updateEntity<T>(entity: EntityName, id: string, data: Partial<T>): Promise<T> {
  const res = await fetch(`${base}/${entity}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Base44 API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteEntity(entity: EntityName, id: string): Promise<void> {
  const res = await fetch(`${base}/${entity}/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Base44 API error ${res.status}: ${text}`);
  }
}

export async function getEntity<T>(entity: EntityName, id: string): Promise<T> {
  const res = await fetch(`${base}/${entity}/${id}`, { headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Base44 API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getAllEntities<T>(
  entity: EntityName,
  query?: Record<string, unknown>
): Promise<T[]> {
  const all: T[] = [];
  let skip = 0;
  const limit = 500;
  while (true) {
    const res = await queryEntities<T>(entity, { limit, skip, query });
    all.push(...res.entities);
    if (all.length >= res.count) break;
    skip += limit;
  }
  return all;
}
