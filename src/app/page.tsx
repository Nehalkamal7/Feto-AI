import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { PricingTable } from "@/components/landing/PricingTable";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BentoGrid />
        <PricingTable />
      </main>
      <Footer />
    </div>
  );
}
