"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingBag,
  Truck,
  RotateCcw,
  CreditCard,
  UserCircle,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const faqCategories = [
  {
    title: "Orders & Shipping",
    icon: ShoppingBag,
    questions: [
      {
        q: "How do I track my order?",
        a: "You can track your order by logging into your account and visiting the Orders page. Alternatively, use the tracking number provided in your shipping confirmation email.",
      },
      {
        q: "What are the shipping options and costs?",
        a: "We offer standard shipping (3-5 business days) for $5.99. Orders over $50 qualify for free shipping. Express shipping (1-2 business days) is available for $12.99.",
      },
      {
        q: "How long will it take to receive my order?",
        a: "Standard shipping typically takes 3-5 business days. Express shipping arrives in 1-2 business days. Orders are processed within 24 hours Monday-Friday.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: RotateCcw,
    questions: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 30 days of purchase. Items must be unworn/unused with original tags attached. Customized items are non-returnable unless defective.",
      },
      {
        q: "How do I initiate a return?",
        a: "Log into your account, go to Orders, select the item you wish to return, and follow the return instructions. You'll receive a prepaid return label via email.",
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 3-5 business days after we receive your return. The amount will be credited to your original payment method.",
      },
    ],
  },
  {
    title: "Payment & Security",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. Student accounts can also use Maverick Dollars.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details.",
      },
      {
        q: "Can I use multiple payment methods?",
        a: "Yes, you can split your payment between a credit card and Maverick Dollars. Contact customer service for assistance with split payments.",
      },
    ],
  },
  {
    title: "Account Management",
    icon: UserCircle,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button in the top right corner. Enter your UTA email address and create a password. Verify your email to complete registration.",
      },
      {
        q: "Can I use my UTA student ID to shop?",
        a: "Yes, you can link your UTA student ID to your account for easy access to student discounts and Maverick Dollars payment option.",
      },
      {
        q: "How do I reset my password?",
        a: "Click 'Sign In', then 'Forgot Password'. Enter your email address to receive password reset instructions.",
      },
    ],
  },
  {
    title: "Product Information",
    icon: Shield,
    questions: [
      {
        q: "What size should I order?",
        a: "Check our size guide for detailed measurements. For apparel, we recommend measuring a similar item you own and comparing it to our size chart.",
      },
      {
        q: "Are your products officially licensed?",
        a: "Yes, all UTA branded merchandise is officially licensed and approved by the university. We source directly from authorized manufacturers.",
      },
      {
        q: "Do you offer customization?",
        a: "Yes, select items can be customized with names, numbers, or graduation years. Look for the 'Customize' option on eligible products.",
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filterQuestions = (category) => {
    if (!searchQuery) return category.questions;
    return category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-[#0064B1] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Find answers to common questions about UTA Market products,
              orders, shipping, and more.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search FAQ..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8">
            {faqCategories.map((category, categoryIndex) => {
              const filteredQuestions = filterQuestions(category);
              if (filteredQuestions.length === 0) return null;

              return (
                <div
                  key={category.title}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                      <category.icon className="h-6 w-6 text-[#0064B1]" />
                      <h2 className="text-xl font-bold">{category.title}</h2>
                    </div>
                  </div>
                  <div className="divide-y">
                    {filteredQuestions.map((question, questionIndex) => {
                      const isExpanded =
                        expandedQuestions[`${categoryIndex}-${questionIndex}`];
                      return (
                        <div key={questionIndex} className="p-6">
                          <button
                            className="w-full flex items-center justify-between gap-4 text-left"
                            onClick={() =>
                              toggleQuestion(categoryIndex, questionIndex)
                            }
                          >
                            <h3 className="font-medium text-lg">
                              {question.q}
                            </h3>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 flex-shrink-0 text-zinc-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 flex-shrink-0 text-zinc-500" />
                            )}
                          </button>
                          {isExpanded && (
                            <p className="mt-4 text-zinc-600">{question.a}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Support */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-zinc-600 mb-6">
              Our support team is here to help. Contact us through any of these
              channels:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <a
                href="/contact"
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg border hover:border-[#0064B1] transition-colors"
              >
                <Truck className="h-5 w-5 text-[#0064B1]" />
                <span className="font-medium">Contact Support</span>
              </a>
              <a
                href="tel:+18175550123"
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg border hover:border-[#0064B1] transition-colors"
              >
                <CreditCard className="h-5 w-5 text-[#0064B1]" />
                <span className="font-medium">(817) 555-0123</span>
              </a>
              <a
                href="mailto:support@utamarket.com"
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg border hover:border-[#0064B1] transition-colors"
              >
                <Shield className="h-5 w-5 text-[#0064B1]" />
                <span className="font-medium">Email Us</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
