"use client";

import { Button } from "../components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import Image from "next/image";
import Link from "next/link";

const heroSlides = [
  {
    id: 1,
    title: "Show Your Maverick Pride",
    description:
      "Official UTA apparel and merchandise for students, faculty, and alumni",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop",
    buttonText: "Shop Now",
    buttonLink: "/listings",
    color: "bg-blue-600",
  },
  {
    id: 2,
    title: "New Fall Collection",
    description:
      "Get ready for the semester with our latest UTA gear and accessories",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
    buttonText: "Explore Collection",
    buttonLink: "/category/spirit-gear",
    color: "bg-orange-600",
  },
  {
    id: 3,
    title: "Graduation Essentials",
    description:
      "Celebrate your achievement with official UTA graduation merchandise",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2069&auto=format&fit=crop",
    buttonText: "Shop Gifts",
    buttonLink: "/category/gifts",
    color: "bg-blue-600",
  },
];

export function HeroSection() {
  return (
    <section className="relative bg-black text-white">
      <Carousel className="w-full">
        <CarouselContent>
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[600px]">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover opacity-60"
                  priority
                />
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                      <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                      <p className="text-xl mb-8">{slide.description}</p>
                      <Button
                        asChild
                        className={`${slide.color} hover:opacity-90`}
                      >
                        <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
