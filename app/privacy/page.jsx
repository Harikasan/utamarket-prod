"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src="/uta-star.png"
                    alt="UTA Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#0064B1] mb-2">
                Privacy Policy
              </h1>
              <p className="text-zinc-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Privacy Policy Content */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      1. Information We Collect
                    </h2>
                    <div className="space-y-4">
                      <p className="text-zinc-700 leading-relaxed">
                        To provide you with the best possible UTAMarket
                        experience, we collect:
                      </p>
                      <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                        <li>
                          <span className="font-medium">
                            Account Information:
                          </span>{" "}
                          Your name, UTA student ID, and @mavs.uta.edu email
                        </li>
                        <li>
                          <span className="font-medium">Profile Data:</span>{" "}
                          Date of birth and contact details
                        </li>
                        <li>
                          <span className="font-medium">
                            Shopping Activity:
                          </span>{" "}
                          Your purchases, browsing history, and wishlist items
                        </li>
                        <li>
                          <span className="font-medium">Interaction Data:</span>{" "}
                          How you interact with products, including views,
                          clicks, and time spent
                        </li>
                        <li>
                          <span className="font-medium">
                            Device Information:
                          </span>{" "}
                          Basic data about your device and how you access
                          UTAMarket
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      2. How We Use Your Information
                    </h2>
                    <div className="space-y-4">
                      <p className="text-zinc-700 leading-relaxed">
                        Your information helps us:
                      </p>
                      <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                        <li>
                          <span className="font-medium">
                            Verify Your Identity:
                          </span>{" "}
                          Confirm you're a UTA student
                        </li>
                        <li>
                          <span className="font-medium">Process Orders:</span>{" "}
                          Handle your purchases and deliveries
                        </li>
                        <li>
                          <span className="font-medium">
                            Personalize Experience:
                          </span>{" "}
                          Show you relevant products and content
                        </li>
                        <li>
                          <span className="font-medium">
                            Power AI Recommendations:
                          </span>{" "}
                          Our AI system learns from community shopping patterns
                          to suggest products you might like
                        </li>
                        <li>
                          <span className="font-medium">
                            Improve UTAMarket:
                          </span>{" "}
                          Make the platform better based on how students use it
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      3. AI Recommendation System
                    </h2>
                    <div className="space-y-4">
                      <p className="text-zinc-700 leading-relaxed">
                        Our AI recommendation system uses your data to:
                      </p>
                      <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                        <li>Learn from your browsing and purchase history</li>
                        <li>
                          Understand product preferences of similar students
                        </li>
                        <li>Suggest items based on current UTA trends</li>
                        <li>
                          Show personalized recommendations on your homepage
                        </li>
                        <li>Highlight relevant items in search results</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      4. Data Protection
                    </h2>
                    <p className="text-zinc-700 leading-relaxed">
                      We keep your data secure and don't share it with third
                      parties. Your information stays within UTAMarket and is
                      only used to improve your shopping experience and power
                      our AI recommendations.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      5. Contact Us
                    </h2>
                    <p className="text-zinc-700 leading-relaxed">
                      Questions about your data? Contact us at{" "}
                      <a
                        href="mailto:privacy@utamarket.com"
                        className="text-[#0064B1] hover:underline"
                      >
                        privacy@utamarket.com
                      </a>
                    </p>
                  </section>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
