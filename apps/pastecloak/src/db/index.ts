import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// For query purposes
const queryClient = postgres(connectionString, {prepare: false});
export const db = drizzle(queryClient, { schema });

// Export schema for use in other files
export * from './schema';

