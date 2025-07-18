// db/index.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "./schema";

// for query purposes
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });
