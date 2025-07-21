// src\components\layout\Section.tsx

import type { ReactNode } from "react";

/**
 * Section
 * -------
 * Layout wrapper for page sections with consistent spacing + max width.
 * Drop your content as children.
 *
 * Pro: If you wanna add more props (like `className`), it’s easy to scale up.
 */
export default function Section({ children }: { children: ReactNode }) {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto mt-10">
      {children}
    </section>
  );
}
