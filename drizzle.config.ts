import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema", // your schema path
  out: "./drizzle/migrations", // where to store migrations
  dialect: "postgresql", // ✅ NEW REQUIRED FIELD
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ✅ pass full Postgres connection string
  },
});
