// src/types/better-auth.d.ts

/**
 * Module declaration for "better-auth" package.
 * This allows TypeScript to not freak out if the library is JS or missing types.
 *
 * 👉 You can extend the function signatures as you adopt more of the library!
 */
declare module "better-auth" {
  // Loosely typed for now; update as needed for stricter typings.
  export function betterAuth(config: any): any;
}
