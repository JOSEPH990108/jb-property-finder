// app/layout.tsx

import "@/styles/globals.css";
import "@/styles/embla.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import RouteTracker from "@/components/layout/RouteTracker";
import LeadFormModal from "@/components/utils/LeadFormModal";
import AuthHydration from "@/components/utils/AuthHydration";
import { Toaster } from "sonner";
import { AuthUser } from "@/types/property";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JB Property Finder",
  description:
    "Browse the best properties in Johor Bahru. New launches, sub-sales and rentals all in one place.",
};

function getUserFromHeaders(hdrs: Headers): AuthUser | null {
  const userId = hdrs.get("x-user-id");

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    name: hdrs.get("x-user-name") || "",
    email: hdrs.get("x-user-email") || null,
    phone: hdrs.get("x-user-phone") || null,
    image: hdrs.get("x-user-image") || null, // Assuming image might be passed
    isAgent: hdrs.get("x-user-agent")?.toLowerCase() === "true",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getUserFromHeaders(await headers());
  console.log("User from layout: ", user);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "JB Property Finder",
              url: "https://jbpropertyfinder.com",
              description:
                "Browse the best properties in Johor Bahru. New launches, sub-sales and rentals all in one place.",
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-white dark:bg-zinc-950 transition-colors`}
      >
        <ThemeProvider>
          <RouteTracker />
          <AuthHydration user={user} />
          <Navbar />
          <LeadFormModal />
          <main className="min-h-screen">
            {children}
            <Toaster richColors position="top-center" />
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
