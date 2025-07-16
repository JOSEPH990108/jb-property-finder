"use client";

import LoanCalculator from "@/components/loan/LoanCalculator";
import LoanStatistic from "@/components/loan/LoanStatistic";
import LoanSummary from "@/components/loan/LoanSummary";
import LoanAmortizationTable from "@/components/loan/LoanAmortizationTable";
import Section from "@/components/layout/Section";
import CashRequired from "@/components/loan/CashRequired";
import HeroSlider from "@/components/utils/HeroSlider";
import PropertyCardGallery from "@/components/utils/PropertyCardGallery";
import { Property } from "@/types/property";
import BaseEmblaCarousel from "@/components/emblaCarousel/EmblaBaseCarousel";
import useDeviceDetect from "@/hooks/useDeviceDetect";
import { useHydrated } from "@/hooks/useHydrated";
import { useLeadFormStore } from "@/stores/leadFormStore";

export default function HomePage() {
  const isMobile = useDeviceDetect();
  const hydrated = useHydrated();
  const openLeadForm = useLeadFormStore((state) => state.openForm);
  const slides = [
    {
      id: 1,
      imageUrl: "/images/home.jpg",
      heading: "Find Your Dream Property in Johor Bahru",
      subheading:
        "Discover new projects, sub-sale, and rental listings all in one place.",
      ctaText: "Explore Projects",
      ctaLink: "/projects",
      alt: "Modern residential property in Johor Bahru",
    },
    {
      id: 2,
      imageUrl: "/images/living-room.jpg",
      heading: "Live Near Everything You Love",
      subheading:
        "Shopping, schools, and serene neighborhoods just minutes away.",
      ctaText: "View Listings",
      ctaLink: "/listings",
      alt: "Spacious living room interior",
    },
    {
      id: 3,
      imageUrl: "/images/apartment-jb.jpg",
      heading: "Invest in Property with Confidence",
      subheading: "We help you choose the right one for your future.",
      ctaText: "Get Started",
      ctaLink: "/contact",
      alt: "Modern apartment building in Johor Bahru",
    },
  ];
  const propertyData: Property = {
    id: 1,
    projectName: "Sky Heights Residence",
    location: "Taman Sutera Utama, Johor Bahru",
    price: 850000,
    sqft: 850,
    rooms: 3,
    bathrooms: 2,
    images: ["/images/home.jpg", "/images/living-room.jpg"],
    category: "For Sale",
    status: "Published",
    propertyType: "Condo",
    area: "Skudai",
    listType: "New Launch",
    dateCompleted: "2023-12-01",
    tenure: "Freehold",
    developer: "ABC Developer",
  };
  // Sample property data array
  const propertyList: Property[] = [
    {
      id: 1,
      projectName: "Sky Heights Residence",
      location: "Taman Sutera Utama, Johor Bahru",
      price: 850000,
      sqft: 850,
      rooms: 3,
      bathrooms: 2,
      images: ["/images/home.jpg", "/images/living-room.jpg"],
      category: "For Sale",
      status: "Published",
      propertyType: "Condo",
      area: "Skudai",
      listType: "New Launch",
      dateCompleted: "2023-12-01",
      tenure: "Freehold",
      developer: "ABC Developer",
    },
    {
      id: 2,
      projectName: "Ocean View Villas",
      location: "Penang Island",
      price: 1200000,
      sqft: 1200,
      rooms: 4,
      bathrooms: 3,
      images: ["/images/apartment-jb.jpg", "/images/property-hero.jpg"],
      category: "For Sale",
      status: "Featured",
      propertyType: "Villa",
      area: "Batu Ferringhi",
      listType: "Premium",
      dateCompleted: "2024-06-01",
      tenure: "Leasehold",
      developer: "XYZ Properties",
    },
    {
      id: 3,
      projectName: "Urban Loft Apartments",
      location: "Kuala Lumpur City Center",
      price: 650000,
      sqft: 700,
      rooms: 2,
      bathrooms: 2,
      images: ["/images/living-room.jpg", "/images/apartment-jb.jpg"],
      category: "For Rent",
      status: "Published",
      propertyType: "Apartment",
      area: "KLCC",
      listType: "Ready Unit",
      dateCompleted: "2022-03-15",
      tenure: "Freehold",
      developer: "Metro Builders",
    },
  ];
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
          {propertyList.map((property) => (
            <PropertyCardGallery
              property={property}
              onApplyClick={() => {
                // Open lead form modal for this property
                console.log("Apply for:", property.projectName);
                openLeadForm();
              }}
              onWhatsAppClick={() => {
                window.open(
                  `https://wa.me/60123456789?text=Inquiry about ${encodeURIComponent(
                    property.projectName
                  )}`
                );
              }}
            />
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

      <Section>
        <PropertyCardGallery property={propertyData} />
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
