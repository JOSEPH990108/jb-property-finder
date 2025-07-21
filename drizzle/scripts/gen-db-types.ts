// drizzle/scripts/generate-db-types.ts

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ========== ESM __dirname Polyfill ==========
// Node ESM modules don't have __dirname by default, so we DIY it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== CONFIGURATION ==========

// --- SCHEMA MODULES ---
// Define your schema import locations and an alias for each section.
// Edit these when you add new schemas to your project!
const schemaModules = {
  Core: { path: "@/db/schema/core", alias: "core" },
  Properties: { path: "@/db/schema/properties", alias: "properties" },
  Projects: { path: "@/db/schema/projects", alias: "projects" },
  Agents: { path: "@/db/schema/agents", alias: "agents" },
};

// --- OUTPUT FILE ---
// This is where the generated types will be dumped.
const outputFile = path.resolve(__dirname, "../../src/types/db.ts");

// --- INSERT TYPE OVERRIDES ---
// If you need special-cased types for inserts (e.g., omit "id"), set them here.
// Key: Table name | Value: Custom type expression
const insertTypeOverrides: Record<string, string> = {
  loginHistories: 'Omit<InferInsertModel<typeof core.loginHistories>, "id">',
};

// ========== HELPERS ==========

// snake_case or plural to PascalCase (e.g., 'users' -> 'User', 'user_roles' -> 'UserRole')
function toPascalCase(str: string) {
  // Basic singularization (could be improved for weird plurals)
  const singular = str.endsWith("ies")
    ? str.slice(0, -3) + "y"
    : str.replace(/s$/, "");
  return singular.replace(/(^|_|\s)(\w)/g, (_, __, c) => c.toUpperCase());
}

// Drizzle ORM marks tables with this internal symbol.
const DRIZZLE_TABLE_SYMBOL = Symbol.for("drizzle:IsDrizzleTable");

// ========== MAIN SCRIPT ==========

async function generateTypes() {
  // --- Header ---
  const lines: string[] = [
    `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.`,
    `// Generated at: ${new Date().toISOString()}`,
    ``,
    `import type { InferSelectModel, InferInsertModel } from "drizzle-orm";`,
  ];

  // --- Schema Imports ---
  for (const { path, alias } of Object.values(schemaModules)) {
    lines.push(`import * as ${alias} from "${path}";`);
  }
  lines.push(``);

  // --- Type Generation for Each Schema Module ---
  for (const [sectionName, { path: modulePath, alias }] of Object.entries(
    schemaModules
  )) {
    console.log(`🔎 Processing ${sectionName} schema...`);

    lines.push(
      `// =================================================================`,
      `// ${sectionName} Schema Types`,
      `// =================================================================`,
      ``
    );

    // Dynamic import: grabs your schema's exports at runtime
    const schema = await import(modulePath);

    // Find all Drizzle tables in the module
    const tableKeys = Object.keys(schema)
      .filter((key) => {
        const value = schema[key as keyof typeof schema];
        return (
          typeof value === "object" &&
          value !== null &&
          DRIZZLE_TABLE_SYMBOL in value
        );
      })
      .sort();

    if (tableKeys.length === 0) {
      console.warn(`⚠️ No tables found in ${sectionName} schema.`);
      continue;
    }

    // --- Per-table Type Exports ---
    for (const key of tableKeys) {
      const typeName = toPascalCase(key); // e.g. users -> User
      const qualifiedKey = `${alias}.${key}`;

      // --- Select Type (Row representation) ---
      lines.push(`// ${typeName}: Select Model`);
      lines.push(
        `export type ${typeName} = InferSelectModel<typeof ${qualifiedKey}>;`
      );

      // --- Insert Type (New row creation, possibly with override) ---
      const customInsertType = insertTypeOverrides[key];
      if (customInsertType) {
        lines.push(`export type New${typeName} = ${customInsertType};`);
      } else {
        lines.push(
          `export type New${typeName} = InferInsertModel<typeof ${qualifiedKey}>;`
        );
      }
      lines.push(``);
    }
  }

  // --- Write to File ---
  fs.writeFileSync(outputFile, lines.join("\n").trim() + `\n`, "utf8");
  console.log(`\n✅ Successfully generated types at: ${outputFile}`);
}

// ========== EXECUTION ENTRYPOINT ==========

generateTypes().catch((err) => {
  console.error("❌ Error generating types:", err);
  process.exit(1);
});
