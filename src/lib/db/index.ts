import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("./notlinear.db");
// Enable WAL mode for better concurrency and performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 1000000000'); // 1GB cache
sqlite.pragma('temp_store = memory');
sqlite.pragma('mmap_size = 268435456'); // 256MB memory map

export const db = drizzle(sqlite, { schema });

