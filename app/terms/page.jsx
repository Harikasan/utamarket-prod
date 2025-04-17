"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export default function TermsPage() {
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
                Terms of Service
              </h1>
              <p className="text-zinc-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Terms Content */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      1. Introduction
                    </h2>
                    <p className="text-zinc-700 leading-relaxed">
                      Welcome to UTAMarket, the official marketplace platform
                      for The University of Texas at Arlington community. By
                      using our services, you agree to these terms. Please read
                      them carefully.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      2. Eligibility
                    </h2>
                    <div className="space-y-4">
                      <p className="text-zinc-700 leading-relaxed">
                        To use UTAMarket, you must be:
                      </p>
                      <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                        <li>A current UTA student with a valid student ID</li>
                        <li>At least 18 years of age</li>
                        <li>Able to form legally binding contracts</li>
                        <li>
                          In possession of a valid @mavs.uta.edu email address
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      3. Account Registration
                    </h2>
                    <div className="space-y-4">
                      <p className="text-zinc-700 leading-relaxed">
                        You agree to:
                      </p>
                      <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                        <li>
                          Provide accurate and complete registration information
                        </li>
                        <li>
                          Maintain the security of your account credentials
                        </li>
                        <li>Promptly update any changes to your information</li>
                        <li>
                          Accept responsibility for all activities under your
                          account
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      4. Marketplace Rules
                    </h2>
                    <div className="space-y-4">
                      <p className="text-zinc-700 leading-relaxed">
                        When using UTAMarket, you agree not to:
                      </p>
                      <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                        <li>
                          Sell prohibited items (weapons, illegal goods, etc.)
                        </li>
                        <li>Post false, inaccurate, or misleading content</li>
                        <li>
                          Manipulate prices or interfere with other listings
                        </li>
                        <li>
                          Violate any applicable UTA policies or regulations
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      5. Transactions
                    </h2>
                    <div className="space-y-4">
                      <p className="text-zinc-700 leading-relaxed">
                        All transactions must:
                      </p>
                      <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                        <li>
                          Be conducted through the platform's payment system
                        </li>
                        <li>Comply with our pricing and fee policies</li>
                        <li>
                          Follow the platform's shipping and delivery guidelines
                        </li>
                        <li>Adhere to our return and refund policies</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      6. Content Guidelines
                    </h2>
                    <p className="text-zinc-700 leading-relaxed">
                      All content must be appropriate for the UTA community,
                      respectful, and comply with academic integrity standards.
                      UTAMarket reserves the right to remove any content that
                      violates these guidelines.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      7. Intellectual Property
                    </h2>
                    <p className="text-zinc-700 leading-relaxed">
                      Users must respect intellectual property rights and only
                      sell items they have the right to sell. The UTA name,
                      logo, and related marks are property of the university and
                      used under license.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      8. Termination
                    </h2>
                    <p className="text-zinc-700 leading-relaxed">
                      UTAMarket reserves the right to suspend or terminate
                      accounts that violate these terms or engage in fraudulent
                      activity. Account termination may be reported to
                      university authorities.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      9. Changes to Terms
                    </h2>
                    <p className="text-zinc-700 leading-relaxed">
                      We may modify these terms at any time. Continued use of
                      UTAMarket after changes constitutes acceptance of the new
                      terms. Users will be notified of significant changes.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-[#0064B1] mb-4">
                      10. Contact Information
                    </h2>
                    <p className="text-zinc-700 leading-relaxed">
                      For questions about these terms, contact us at{" "}
                      <a
                        href="mailto:support@utamarket.com"
                        className="text-[#0064B1] hover:underline"
                      >
                        support@utamarket.com
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
