import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    id: 1,
    name: "Apparel",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop",
    link: "/category/apparel",
    count: 145,
  },
  {
    id: 2,
    name: "Accessories",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1974&auto=format&fit=crop",
    link: "/category/accessories",
    count: 89,
  },
  {
    id: 3,
    name: "Spirit Gear",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop",
    link: "/category/spirit-gear",
    count: 64,
  },
  {
    id: 4,
    name: "School Supplies",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=1974&auto=format&fit=crop",
    link: "/category/school-supplies",
    count: 112,
  },
  {
    id: 5,
    name: "Gifts",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1972&auto=format&fit=crop",
    link: "/category/gifts",
    count: 57,
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-16 bg-zinc-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-zinc-600 max-w-2xl mx-auto">
            Discover our wide selection of official UTA merchandise and show
            your Maverick pride
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-xl">
                      {category.name}
                    </h3>
                    <p className="text-zinc-300 text-sm">
                      {category.count} items
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
