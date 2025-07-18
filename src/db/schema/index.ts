/// db/schema/index.ts
/// Barrel file to export all schemas and relations
import * as enums from "./_enums";
import * as core from "./core";
import * as properties from "./properties";
import * as projects from "./projects";
import * as agents from "./agents";
import * as profiles from "./profiles";
import * as advanced from "./advanced";
import * as relations from "./_relations";

// Export all schemas and relations
const schema = {
  ...enums,
  ...core,
  ...properties,
  ...projects,
  ...agents,
  ...profiles,
  ...advanced,
  ...relations,
};

export default schema;
