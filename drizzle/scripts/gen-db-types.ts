// drizzle/scripts/generate-db-types.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper: Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---

// 1. Define where your schema files are located.
// The key is the section name (e.g., "Core"), and the value is the import alias.
const schemaModules = {
  Core: { path: "@/db/schema/core", alias: "core" },
  Properties: { path: "@/db/schema/properties", alias: "properties" },
  Projects: { path: "@/db/schema/projects", alias: "projects" },
  Agents: { path: "@/db/schema/agents", alias: "agents" },
};

// 2. Define the output file path.
const outputFile = path.resolve(__dirname, "../../src/types/db.ts");

// 3. Define any custom overrides for insert types.
// Useful for types that need `Omit`, etc.
const insertTypeOverrides: Record<string, string> = {
  loginHistories: 'Omit<InferInsertModel<typeof core.loginHistories>, "id">',
};

// --- SCRIPT LOGIC ---

// Helper: snake_case to PascalCase (e.g., 'users' -> 'User')
function toPascalCase(str: string) {
  // Remove plural 's' at the end if it exists
  const singular = str.endsWith("ies")
    ? str.slice(0, -3) + "y"
    : str.replace(/s$/, "");
  return singular.replace(/(^|_|\s)(\w)/g, (_, __, c) => c.toUpperCase());
}

// Drizzle's internal symbol to identify tables
const DRIZZLE_TABLE_SYMBOL = Symbol.for("drizzle:IsDrizzleTable");

async function generateTypes() {
  const lines: string[] = [
    `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.`,
    `// Generated at: ${new Date().toISOString()}`,
    ``,
    `import type { InferSelectModel, InferInsertModel } from "drizzle-orm";`,
  ];

  // Add imports for all schema modules
  for (const { path, alias } of Object.values(schemaModules)) {
    lines.push(`import * as ${alias} from "${path}";`);
  }
  lines.push(``);

  // Process each schema module
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

    // Dynamically import the module
    const schema = await import(modulePath);

    // Find all exported tables in the module
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

    // Generate types for each table
    for (const key of tableKeys) {
      const typeName = toPascalCase(key);
      const qualifiedKey = `${alias}.${key}`;

      // Select Type
      lines.push(`// ${typeName}`);
      lines.push(
        `export type ${typeName} = InferSelectModel<typeof ${qualifiedKey}>;`
      );

      // Insert Type (check for override first)
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

  // Write to file
  fs.writeFileSync(outputFile, lines.join("\n").trim() + `\n`, "utf8");
  console.log(`\n✅ Successfully generated types at: ${outputFile}`);
}

generateTypes().catch((err) => {
  console.error("❌ Error generating types:", err);
  process.exit(1);
});
