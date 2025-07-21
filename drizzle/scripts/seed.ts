// Seeding Script for Properties Schema
// -----------------------------------
// Populates lookup tables with basic area/category/type/status/feature data.
// Run this after running initial migrations.
// Safe for idempotent (multi) runs.

import "dotenv/config";
console.log("✅ DATABASE_URL:", process.env.DATABASE_URL);

import { db } from "@/db";
import {
  states,
  areaCategories,
  areas,
  features,
  propertyCategories,
  propertyTypes,
  tenureTypes,
  projectStatuses,
  projectTypes,
} from "@/db/schema/properties";

// --- Helper: Converts "Name String" => "name-string" (slug) ---
function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove non-word chars
    .replace(/\s+/g, "-"); // Spaces to dashes
}

async function main() {
  // ========== 1. Seed States ==========
  // Only Johor and KL for now—expand as needed.
  const [johor] = await db
    .insert(states)
    .values({ name: "Johor" })
    .onConflictDoNothing()
    .returning();

  const [kualaLumpur] = await db
    .insert(states)
    .values({ name: "Kuala Lumpur" })
    .onConflictDoNothing()
    .returning();

  // ========== 2. Seed Area Categories ==========
  // Area categories for grouping city neighborhoods.
  const categoryNames = [
    "Iskandar Puteri",
    "Skudai",
    "Johor Bahru",
    "Tebrau/Austin",
    "Masai/Pasir Gudang",
    "Kulai/Senai",
  ];

  await db
    .insert(areaCategories)
    .values(categoryNames.map((name) => ({ name })))
    .onConflictDoNothing();

  // Fetch area category IDs for FK mapping below
  const areaCategoryRows = await db.select().from(areaCategories);
  const getCatId = (name: string): number | null =>
    areaCategoryRows.find((c) => c.name === name)?.id ?? null;

  // ========== 3. Seed Areas ==========
  // Map each area category to its specific neighborhoods/areas.
  const areaMap: Record<string, string[]> = {
    "Iskandar Puteri": [
      "Bukit Indah",
      "Nusa Bestari",
      "Gelang Patah",
      "Medini",
      "Puteri Harbour",
      "Eco Botanic",
      "Kota Iskandar",
      "Iskandar Puteri",
    ],
    Skudai: [
      "Taman Universiti",
      "Taman Sutera Utama",
      "Taman Sri Skudai",
      "Skudai",
    ],
    "Johor Bahru": [
      "Johor Bahru City Centre",
      "Larkin",
      "Stulang Laut",
      "Taman Pelangi",
      "Taman Century",
      "Wadi Hana",
      "Molek",
    ],
    "Tebrau/Austin": [
      "Mount Austin",
      "Taman Desa Tebrau",
      "Adda Heights",
      "Taman Daya",
      "Taman Setia Indah",
      "Pandan",
      "Tebrau",
    ],
    "Masai/Pasir Gudang": [
      "Permas Jaya",
      "Masai",
      "Bandar Seri Alam",
      "Pasir Gudang",
      "Taman Rinting",
      "Plentong",
      "Ulu Tiram",
    ],
    "Kulai/Senai": [
      "Kulai Town",
      "Bandar Putra Kulai",
      "Indahpura",
      "Senai",
      "Saleng",
    ],
  };

  // Insert all areas, FKed to category/state. Handles conflicts for reruns.
  for (const [categoryName, areaNames] of Object.entries(areaMap)) {
    const categoryId = getCatId(categoryName);
    if (!categoryId) continue; // Skip if category missing

    await db
      .insert(areas)
      .values(
        areaNames.map((name) => ({
          name,
          slug: toSlug(name),
          stateId: johor.id,
          categoryId,
        }))
      )
      .onConflictDoNothing();
  }

  // ========== 4. Seed Property Categories ==========
  // E.g. Landed, High-Rise, Others (expand as needed)
  const propertyCategoryNames = ["Landed", "High-Rise", "Others"];
  await db
    .insert(propertyCategories)
    .values(propertyCategoryNames.map((name) => ({ name })))
    .onConflictDoNothing();

  const propertyCategoryRows = await db.select().from(propertyCategories);
  const getPropertyCategoryId = (name: string): number | null =>
    propertyCategoryRows.find((c) => c.name === name)?.id ?? null;

  // ========== 5. Seed Tenure Types ==========
  // Freehold, Leasehold, Malay Reserve, Others
  const tenureTypeNames = ["Freehold", "Leasehold", "Malay Reserve", "Others"];
  await db
    .insert(tenureTypes)
    .values(tenureTypeNames.map((name) => ({ name })))
    .onConflictDoNothing();

  // ========== 6. Seed Property Types ==========
  // Each property type is linked to a category (FK).
  const propertyTypeList = [
    { name: "Single Storey Terrace House", category: "Landed" },
    { name: "Double Storey Terrace House", category: "Landed" },
    { name: "Triple Storey Terrace House", category: "Landed" },
    { name: "Cluster House", category: "Landed" },
    { name: "Semi-Detached", category: "Landed" },
    { name: "Bungalow", category: "Landed" },
    { name: "Superlink", category: "Landed" },
    { name: "Townhouse", category: "Landed" },
    { name: "Flat", category: "High-Rise" },
    { name: "Serviced Apartment", category: "High-Rise" },
    { name: "Condo", category: "High-Rise" },
  ];

  // Validate/attach FKs, skip if no match
  const validPropertyTypes = propertyTypeList
    .map((type) => {
      const catId = getPropertyCategoryId(type.category);
      if (!catId) return null;
      return {
        name: type.name,
        propertyCategoryId: catId,
      };
    })
    .filter(
      (t): t is { name: string; propertyCategoryId: number } => t !== null
    );

  await db
    .insert(propertyTypes)
    .values(validPropertyTypes)
    .onConflictDoNothing();

  // ========== 7. Seed Project Types ==========
  // Project sales channel (New, Sub-sale, Rent)
  await db
    .insert(projectTypes)
    .values(["New", "Sub-sale", "Rent"].map((name) => ({ name })))
    .onConflictDoNothing();

  // ========== 8. Seed Project Statuses ==========
  // Lifecycle status for projects
  await db
    .insert(projectStatuses)
    .values(
      ["Upcoming", "New Launch", "Under Development", "Completed"].map(
        (name) => ({ name })
      )
    )
    .onConflictDoNothing();

  // ========== 9. Seed Features ==========
  // List of property/unit features
  const featureNames = [
    "Air-Cond Master",
    "Air-Cond Living Room",
    "Cooking Hob",
    "Kitchen Cabinet",
    "Near RTS",
    "Smart Home System",
    "Dual Key",
    "Partially Furnished",
    "Fully Furnished",
    "Unfurnished",
    "Corner Lot",
  ];

  await db
    .insert(features)
    .values(featureNames.map((name) => ({ name })))
    .onConflictDoNothing();

  console.log("✅ Seeding completed successfully!");
}

// Entrypoint: run the async main and handle errors loud and clear
main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
