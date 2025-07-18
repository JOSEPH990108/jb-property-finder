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

// Helper: Generate slug from name
function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}

async function main() {
  // === 1. States ===
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

  // === 2. Area Categories ===
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

  const areaCategoryRows = await db.select().from(areaCategories);
  const getCatId = (name: string): number | null =>
    areaCategoryRows.find((c) => c.name === name)?.id ?? null;

  // === 3. Areas ===
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

  for (const [categoryName, areaNames] of Object.entries(areaMap)) {
    const categoryId = getCatId(categoryName);
    if (!categoryId) continue;

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

  // === 4. Property Categories ===
  const propertyCategoryNames = ["Landed", "High-Rise", "Others"];
  await db
    .insert(propertyCategories)
    .values(propertyCategoryNames.map((name) => ({ name })))
    .onConflictDoNothing();

  const propertyCategoryRows = await db.select().from(propertyCategories);
  const getPropertyCategoryId = (name: string): number | null =>
    propertyCategoryRows.find((c) => c.name === name)?.id ?? null;

  // === 5. Tenure Types ===
  const tenureTypeNames = ["Freehold", "Leasehold", "Malay Reserve", "Others"];
  await db
    .insert(tenureTypes)
    .values(tenureTypeNames.map((name) => ({ name })))
    .onConflictDoNothing();

  // === 6. Property Types ===
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

  // === 7. Project Types ===
  await db
    .insert(projectTypes)
    .values(["New", "Sub-sale", "Rent"].map((name) => ({ name })))
    .onConflictDoNothing();

  // === 8. Project Statuses ===
  await db
    .insert(projectStatuses)
    .values(
      ["Upcoming", "New Launch", "Under Development", "Completed"].map(
        (name) => ({ name })
      )
    )
    .onConflictDoNothing();

  // === 9. Features ===
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

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
