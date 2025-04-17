"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Testimonials } from "@/components/Testimonials";
import { CallToAction } from "@/components/CallToAction";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Trigger AI logs update when the page loads
    const updateAILogs = async () => {
      try {
        const response = await fetch("/api/ai-logs/update");
        const data = await response.json();
        console.log("AI logs update:", data.message);
      } catch (error) {
        console.error("Error updating AI logs:", error);
      }
    };

    updateAILogs();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
