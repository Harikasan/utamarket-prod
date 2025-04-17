"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    orderNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      // Show success toast
      toast.success("Message sent successfully", {
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        orderNumber: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send message", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-[#0064B1] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Have questions about UTA merchandise? We're here to help! Reach
              out to our team for assistance with orders, products, or general
              inquiries.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#0064B1] p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Email Us</h3>
                      <p className="text-zinc-600 mb-1">
                        For general inquiries:
                      </p>
                      <a
                        href="mailto:support@utamarket.com"
                        className="text-[#0064B1] hover:underline"
                      >
                        support@utamarket.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-[#0064B1] p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Call Us</h3>
                      <p className="text-zinc-600 mb-1">
                        Monday to Friday, 9am - 5pm CST
                      </p>
                      <a
                        href="tel:+18175550123"
                        className="text-[#0064B1] hover:underline"
                      >
                        (817) 555-0123
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-[#0064B1] p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Visit Our Store</h3>
                      <p className="text-zinc-600">
                        UTA Campus Store
                        <br />
                        University Center, Suite 100
                        <br />
                        300 W First Street
                        <br />
                        Arlington, TX 76019
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-[#0064B1] p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Store Hours</h3>
                      <p className="text-zinc-600">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Quick Support</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="/faq"
                    className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-[#0064B1] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-[#0064B1]" />
                      <span className="font-medium">FAQs</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                  </a>
                  <a
                    href="/orders"
                    className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-[#0064B1] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-[#0064B1]" />
                      <span className="font-medium">Track Order</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                  </a>
                  <a
                    href="/support"
                    className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-[#0064B1] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-[#0064B1]" />
                      <span className="font-medium">Live Chat</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Smith"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject: value })
                    }
                    disabled={isSubmitting}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Order Inquiry">
                        Order Inquiry
                      </SelectItem>
                      <SelectItem value="Product Question">
                        Product Question
                      </SelectItem>
                      <SelectItem value="Shipping & Delivery">
                        Shipping & Delivery
                      </SelectItem>
                      <SelectItem value="Returns & Refunds">
                        Returns & Refunds
                      </SelectItem>
                      <SelectItem value="Technical Support">
                        Technical Support
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="orderNumber">Order Number (Optional)</Label>
                  <Input
                    id="orderNumber"
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, orderNumber: e.target.value })
                    }
                    placeholder="e.g. ORD-1234"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="How can we help you?"
                    className="h-32"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0064B1] hover:bg-[#0064B1]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Visit Our Store</h2>
            <div className="aspect-video w-full rounded-lg overflow-hidden border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3356.2185504568342!2d-97.11195752433912!3d32.73338697368201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864e7d7277902899%3A0xd61a077710c1e2bd!2sUTA%20Bookstore!5e0!3m2!1sen!2sus!4v1743551254426!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="UTA Bookstore Location"
                aria-label="Map showing UTA Bookstore location"
              ></iframe>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 text-[#0064B1]">
                <MapPin className="h-5 w-5" />
                <p className="font-medium">UTA Bookstore</p>
              </div>
              <p className="mt-1 text-zinc-600 pl-7">
                400 S Pecan St, Arlington, TX 76010
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
