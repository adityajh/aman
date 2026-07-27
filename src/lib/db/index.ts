import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

neonConfig.webSocketConstructor = ws;

// HTTP driver for stateless, fast queries (login, signup)
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// WebSocket connection pool for stateful transactions (RLS)
export const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const dbPool = drizzleServerless(pool, { schema });
