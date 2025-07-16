import fs from "fs";
import path from "path";
import * as schema from "../../src/db/schema";

// Resolve __dirname in ESM
const __dirname = path
  .dirname(new URL(import.meta.url).pathname)
  .replace(/^\/([a-zA-Z]:)/, "$1");

const outputFile = path.join(__dirname, "../../src/types/db.ts");

// Helper: snake_case to PascalCase
function toPascalCase(str: string) {
  return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

// Detect Drizzle tables via internal symbol
const DRIZZLE_TABLE_SYMBOL = Symbol.for("drizzle:IsDrizzleTable");

// Find table exports
const tableKeys = Object.entries(schema)
  .filter(
    ([, value]) =>
      typeof value === "object" &&
      value !== null &&
      DRIZZLE_TABLE_SYMBOL in value
  )
  .map(([key]) => key)
  .sort();

// Find enum exports
const enumDefs = Object.entries(schema)
  .filter(([, value]) => typeof value === "function" && "enumValues" in value)
  .map(([key, value]) => ({
    name: toPascalCase(key),
    values: (value as any).enumValues,
  }));

// Generate file content
const lines: string[] = [
  `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.`,
  `import {\n  ${tableKeys.join(",\n  ")}\n} from "@/db/schema";\n`,
];

// SELECT types
lines.push(`// SELECT types (for reading from DB)`);
lines.push(
  ...tableKeys.map(
    (key) => `export type ${toPascalCase(key)} = typeof ${key}.$inferSelect;`
  )
);

// INSERT types
lines.push(`\n// INSERT types (for inserting into DB)`);
lines.push(
  ...tableKeys.map(
    (key) => `export type New${toPascalCase(key)} = typeof ${key}.$inferInsert;`
  )
);

// ENUM types
if (enumDefs.length > 0) {
  lines.push(`\n// ENUM types`);
  lines.push(
    ...enumDefs.map(
      ({ name, values }) =>
        `export type ${name} = ${values
          .map((v: string) => `"${v}"`)
          .join(" | ")};`
    )
  );
}

// Write to file
fs.writeFileSync(outputFile, lines.join("\n"), "utf8");
console.log("✅ types/db.ts generated!");
