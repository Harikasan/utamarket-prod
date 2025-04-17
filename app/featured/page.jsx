"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedProducts } from "@/components/FeaturedProducts";

export default function FeaturedPage() {
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
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center mb-12">
            <h1 className="text-4xl font-bold text-[#0064B1] mb-4">
              Featured Products
            </h1>
            <p className="text-zinc-600 text-center max-w-2xl">
              Discover our most popular and trending UTA merchandise
            </p>
          </div>
          <FeaturedProducts />
        </div>
      </main>
      <Footer />
    </>
  );
}
