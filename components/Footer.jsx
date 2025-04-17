"use client";

import Link from "next/link";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-xl mb-4">UTAMarket</h3>
            <p className="text-zinc-400 mb-4">
              The ultimate marketplace for UTA students to buy, sell, and trade
              items. Find everything you need for campus life at great prices.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="hover:text-white">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="hover:text-white">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="hover:text-white">
                <Linkedin size={20} />
              </Link>
              <Link href="#" className="hover:text-white">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-zinc-400 hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-zinc-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zinc-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-zinc-400 hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/category/apparel"
                  className="text-zinc-400 hover:text-white"
                >
                  Apparel
                </Link>
              </li>
              <li>
                <Link
                  href="/category/accessories"
                  className="text-zinc-400 hover:text-white"
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/category/spirit-gear"
                  className="text-zinc-400 hover:text-white"
                >
                  Spirit Gear
                </Link>
              </li>
              <li>
                <Link
                  href="/category/school-supplies"
                  className="text-zinc-400 hover:text-white"
                >
                  School Supplies
                </Link>
              </li>
              <li>
                <Link
                  href="/category/gifts"
                  className="text-zinc-400 hover:text-white"
                >
                  Gifts
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">Stay Updated</h3>
            <p className="text-zinc-400 mb-4">
              Subscribe to our newsletter for the latest deals and campus
              marketplace updates.
            </p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-zinc-800 border-zinc-700"
              />
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-zinc-800" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-400 text-sm">
            &copy; {new Date().getFullYear()} UTAMarket. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/help"
              className="text-zinc-400 hover:text-white text-sm"
            >
              Help Center
            </Link>
            <Link
              href="/sell"
              className="text-zinc-400 hover:text-white text-sm"
            >
              Sell on UTAMarket
            </Link>
            <Link
              href="/app"
              className="text-zinc-400 hover:text-white text-sm"
            >
              Download App
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
