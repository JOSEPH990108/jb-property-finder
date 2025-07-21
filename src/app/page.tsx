// src\app\page.tsx
"use client";

import { useEffect } from "react";
import LoanCalculator from "@/components/loan/LoanCalculator";
import LoanStatistic from "@/components/loan/LoanStatistic";
import LoanSummary from "@/components/loan/LoanSummary";
import LoanAmortizationTable from "@/components/loan/LoanAmortizationTable";
import Section from "@/components/layout/Section";
import CashRequired from "@/components/loan/CashRequired";
import HeroSlider from "@/components/utils/HeroSlider";
import BaseEmblaCarousel from "@/components/emblaCarousel/EmblaBaseCarousel";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { useHydrated } from "@/hooks/useHydrated";
import { useLeadFormStore } from "@/stores/leadFormStore";
import { usePropertyStore } from "@/stores/propertyStore";
import { usePropertyFilterStore } from "@/stores/propertyFilterStore";
import ProjectCard from "@/components/utils/ProjectCard";
import LayoutCard from "@/components/utils/ProjectLayoutCard";

export default function HomePage() {
  const isMobile = useDeviceDetect();
  const hydrated = useHydrated();
  const openLeadForm = useLeadFormStore((state) => state.openForm);

  const { projects, allLayouts, fetchProperties } = usePropertyStore();
  const setLayouts = usePropertyFilterStore((state) => state.setLayouts);

  // Fetch on mount if not already loaded
  useEffect(() => {
    if (projects.length === 0) fetchProperties();
  }, [projects.length, fetchProperties]);

  // Sync layouts into the filter store
  useEffect(() => {
    setLayouts(allLayouts);
  }, [allLayouts, setLayouts]);

  return (
    <>
      {/* HERO Section */}
      <HeroSlider />

      <Section>
        <BaseEmblaCarousel
          plugins={["autoplay", "scale"]}
          options={{ loop: true }}
          slideHeight="auto"
          slideSpacing="1 rem"
          slideSize={hydrated ? (isMobile ? "100%" : "55%") : "55%"}
          showArrows={false}
          showDots={false}
          pauseAutoplayOnHover
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.projectId || project.id}
              project={project}
            />
          ))}
        </BaseEmblaCarousel>
      </Section>

      <Section>
        <BaseEmblaCarousel
          plugins={["autoplay", "scale"]}
          options={{ loop: true }}
          slideHeight="auto"
          slideSpacing="1 rem"
          slideSize={hydrated ? (isMobile ? "100%" : "55%") : "55%"}
          showArrows={false}
          showDots={false}
          pauseAutoplayOnHover
        >
          {allLayouts.map((layout) => (
            <LayoutCard key={layout.id} layout={layout} />
          ))}
        </BaseEmblaCarousel>
      </Section>

      {/* LOAN TOOLS Section */}
      <Section>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 px-4 py-6">
          {/* Loan Calculator */}
          <div className="xl:col-span-8">
            <LoanCalculator />
          </div>

          {/* Loan Statistic */}
          <div className="xl:col-span-4 content-center">
            <LoanStatistic />
          </div>

          {/* Loan Summary */}
          <div className="xl:col-span-6">
            <LoanSummary />
          </div>

          {/* Cash Required */}
          <div className="xl:col-span-6">
            <CashRequired />
          </div>

          <div className="xl:col-span-12">
            <LoanAmortizationTable />
          </div>
        </div>
      </Section>

      {/* PROPERTY CAROUSEL Section */}

      {/* CTA or Newsletter Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center bg-primary text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold">
            Stay Updated with the Latest Projects
          </h2>
          <p className="text-lg text-white/90">
            Subscribe to our newsletter and never miss out.
          </p>
          <form className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-black focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-primary font-semibold px-6 py-2 rounded-lg"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
