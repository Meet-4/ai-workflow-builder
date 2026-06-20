/**
 * local-store.ts
 *
 * A lightweight file-based JSON store that replaces MongoDB when the
 * database is unavailable (e.g. network-blocked corporate environments).
 *
 * Data is persisted to  .local-data/  at the project root.
 * This is completely safe for local development — it is never used in production.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".local-data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection<T>(collection: string): T[] {
  ensureDir();
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8")) as T[];
  } catch {
    return [];
  }
}

function writeCollection<T>(collection: string, data: T[]) {
  ensureDir();
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2), "utf-8");
}

function generateId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const localStore = {
  /** Insert a document and return it with _id + timestamps */
  insert<T extends Record<string, unknown>>(
    collection: string,
    doc: T
  ): T & { _id: string; createdAt: string; updatedAt: string } {
    const data = readCollection<T & { _id: string; createdAt: string; updatedAt: string }>(collection);
    const now = new Date().toISOString();
    const newDoc = { ...doc, _id: generateId(), createdAt: now, updatedAt: now };
    data.push(newDoc);
    writeCollection(collection, data);
    return newDoc;
  },

  /** Find documents matching a query object (shallow equality) */
  find<T extends Record<string, unknown>>(
    collection: string,
    query: Partial<T> = {}
  ): (T & { _id: string; createdAt: string; updatedAt: string })[] {
    const data = readCollection<T & { _id: string; createdAt: string; updatedAt: string }>(collection);
    return data
      .filter((doc) =>
        Object.entries(query).every(([k, v]) => (doc as Record<string, unknown>)[k] === v)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** Find a single document by _id */
  findById<T extends Record<string, unknown>>(
    collection: string,
    id: string
  ): (T & { _id: string; createdAt: string; updatedAt: string }) | null {
    const data = readCollection<T & { _id: string; createdAt: string; updatedAt: string }>(collection);
    return data.find((doc) => doc._id === id) ?? null;
  },

  /** Update a document by _id, returns updated doc or null */
  updateById<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    update: Partial<T>
  ): (T & { _id: string; createdAt: string; updatedAt: string }) | null {
    const data = readCollection<T & { _id: string; createdAt: string; updatedAt: string }>(collection);
    const idx = data.findIndex((d) => d._id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...update, updatedAt: new Date().toISOString() };
    writeCollection(collection, data);
    return data[idx];
  },

  /** Delete a document by _id */
  deleteById(collection: string, id: string): boolean {
    const data = readCollection<Record<string, unknown>>(collection);
    const next = data.filter((d) => d._id !== id);
    if (next.length === data.length) return false;
    writeCollection(collection, next);
    return true;
  },
};
