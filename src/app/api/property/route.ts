// src/app/api/property/route.ts

/**
 * Property GET API Route
 * ----------------------
 * GET: Returns all active property projects (with layouts, images, filter info, and options).
 * - Fetches all filter reference tables in parallel (for dropdowns/search)
 * - Assembles each project with related layouts, images, and filter fields
 * - Returns properties[] + filterOptions{}
 * - Handles error with a friendly message
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, layouts, projectImages } from "@/db/schema/projects";
import { developers } from "@/db/schema/agents";
import {
  propertyCategories,
  projectStatuses,
  tenureTypes,
  propertyTypes,
  areas,
  states,
  areaCategories,
  features,
  projectTypes,
} from "@/db/schema/properties";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // --- 1. Fetch all reference/filter tables in parallel (for UI filters) ---
    const [
      statesList,
      areaCategoriesList,
      areasList,
      featuresList,
      propertyCategoriesList,
      propertyTypesList,
      tenureTypesList,
      projectStatusesList,
      projectTypesList,
    ] = await Promise.all([
      db.select().from(states),
      db.select().from(areaCategories),
      db.select().from(areas),
      db.select().from(features),
      db.select().from(propertyCategories),
      db.select().from(propertyTypes),
      db.select().from(tenureTypes),
      db.select().from(projectStatuses),
      db.select().from(projectTypes),
    ]);

    // --- 2. Build { [categoryName]: string[] of propertyType names } ---
    const propertyTypeByCategory: Record<string, string[]> = {};
    propertyCategoriesList.forEach((cat) => {
      propertyTypeByCategory[cat.name] = propertyTypesList
        .filter((t) => t.propertyCategoryId === cat.id)
        .map((t) => t.name);
    });

    // --- 3. Fetch all active projects ---
    const allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.isActive, true));

    // --- 4. Build out each property with layouts, images, and filter fields ---
    const properties = await Promise.all(
      allProjects.map(async (project) => {
        // --- a. Fetch layouts for this project ---
        const projectLayouts = await db.query.layouts.findMany({
          where: eq(layouts.projectId, project.id),
        });

        // --- b. Fetch all images for this project ---
        const allImages = await db.query.projectImages.findMany({
          where: and(
            eq(projectImages.projectId, project.id),
            eq(projectImages.isActive, true)
          ),
          orderBy: [projectImages.order],
        });

        // --- c. Fetch related info (category, status, dev, etc) ---
        const [category, status, developer, type, tenure, area] =
          await Promise.all([
            db.query.propertyCategories.findFirst({
              where: eq(propertyCategories.id, project.propertyCategoryId),
            }),
            db.query.projectStatuses.findFirst({
              where: eq(projectStatuses.id, project.projectStatusId),
            }),
            db.query.developers.findFirst({
              where: eq(developers.id, project.developerId),
            }),
            db.query.propertyTypes.findFirst({
              where: eq(propertyTypes.id, project.propertyTypeId),
            }),
            db.query.tenureTypes.findFirst({
              where: eq(tenureTypes.id, project.tenureTypeId),
            }),
            db.query.areas.findFirst({
              where: eq(areas.id, project.areaId),
            }),
          ]);

        // --- d. Map layouts and their images (with full filter info) ---
        let projectLevelImages: string[] = [];
        const layoutsWithImages = projectLayouts.map((l) => {
          const layoutImages = allImages
            .filter((img) => img.layoutId === l.id)
            .map((img) => img.url);

          projectLevelImages = [...projectLevelImages, ...layoutImages];

          return {
            id: l.id,
            name: l.name,
            bedrooms: l.bedrooms,
            studyRoom: l.studyRoom,
            bathrooms: l.bathrooms,
            squareFeet: l.squareFeet,
            spaPriceBumiMin: l.spaPriceBumiMin,
            spaPriceBumiMax: l.spaPriceBumiMax,
            spaPriceNonBumiMin: l.spaPriceNonBumiMin,
            spaPriceNonBumiMax: l.spaPriceNonBumiMax,
            images: layoutImages,
            // filter meta
            projectId: project.id,
            projectName: project.name,
            projectLocation: project.location,
            category: category?.name ?? "",
            categoryId: project.propertyCategoryId,
            propertyType: type?.name ?? "",
            propertyTypeId: project.propertyTypeId,
            area: area?.name ?? "",
            areaId: project.areaId,
            tenure: tenure?.name ?? "",
            tenureTypeId: project.tenureTypeId,
            developer: developer?.name ?? "",
            developerId: project.developerId,
          };
        });

        // --- e. Return top-level project info, plus main layout stats and all meta IDs ---
        return {
          id: project.id,
          projectName: project.name,
          projectLocation: project.location,
          location: project.location,
          dateCompleted: project.yearOfCompletion
            ? project.yearOfCompletion.toString()
            : "",
          developer: developer?.name ?? "",
          developerId: project.developerId,
          price: projectLayouts[0]?.spaPriceNonBumiMin ?? 0,
          rooms: projectLayouts[0]?.bedrooms ?? 0,
          bathrooms: projectLayouts[0]?.bathrooms ?? 0,
          sqft: projectLayouts[0]?.squareFeet ?? 0,
          images: projectLevelImages,
          category: category?.name ?? "",
          categoryId: project.propertyCategoryId,
          status: status?.name ?? "",
          propertyType: type?.name ?? "",
          propertyTypeId: project.propertyTypeId,
          area: area?.name ?? "",
          areaId: project.areaId,
          tenure: tenure?.name ?? "",
          tenureTypeId: project.tenureTypeId,
          layouts: layoutsWithImages,
        };
      })
    );

    // --- 5. Return both the properties and all filter options for UI/SSR ---
    return NextResponse.json({
      properties,
      filterOptions: {
        states: statesList,
        areaCategories: areaCategoriesList,
        areas: areasList,
        features: featuresList,
        propertyCategories: propertyCategoriesList,
        propertyTypes: propertyTypesList,
        tenureTypes: tenureTypesList,
        projectStatuses: projectStatusesList,
        projectTypes: projectTypesList,
        propertyTypeByCategory,
      },
    });
  } catch (err) {
    // --- 6. Handle any error with a friendly message (and log for server debug) ---
    console.error("Property API error:", err);
    return NextResponse.json(
      { error: "Unable to fetch properties" },
      { status: 500 }
    );
  }
}
