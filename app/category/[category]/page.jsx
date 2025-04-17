"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, useParams } from "next/navigation";

// Category mapping to match database IDs
const categoryIds = {
  apparel: 1,
  accessories: 2,
  "spirit-gear": 3,
  "school-supplies": 4,
  gifts: 5,
};

const sizes = ["XS", "S", "M", "L", "XL", "2XL"];
const colors = ["White", "Gray", "Black", "Blue", "Orange"];
const sortOptions = [
  { value: "newest", label: "New Arrivals" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

// Function to capitalize first letter of each word
const formatCategoryName = (category) => {
  if (!category) return "";
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  });
  const [activeFilters, setActiveFilters] = useState({
    sizes: [],
    colors: [],
    priceRange: [0, 100],
    sort: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categoryData, setCategoryData] = useState({
    name: "",
    id: null,
  });

  // Initialize category data
  useEffect(() => {
    const category = params?.category;
    if (category) {
      const id = categoryIds[category];
      const name = formatCategoryName(category);
      setCategoryData({ id, name });

      if (!id) {
        router.push("/404");
        return;
      }
    }
  }, [params?.category]);

  // Fetch products when category or page changes
  useEffect(() => {
    if (categoryData.id) {
      const page = parseInt(searchParams.get("page")) || 1;
      fetchProducts(page);
    }
  }, [searchParams, categoryData.id, activeFilters.sort]);

  const fetchProducts = async (page) => {
    try {
      setLoading(true);
      const sortParam = activeFilters.sort || "newest";
      const response = await fetch(
        `/api/category?page=${page}&sort=${sortParam}&categoryId=${categoryData.id}`
      );
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        return;
      }

      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      router.push(`/category/${params?.category}?page=${newPage}`);
    }
  };

  const handleSortChange = (value) => {
    setActiveFilters({ ...activeFilters, sort: value });
    router.push(`/category/${params?.category}?page=1`);
  };

  if (!categoryData.id) {
    return null; // or a loading state
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-[#0064B1]">
              {categoryData.name}
            </h1>
            <p className="text-zinc-600 text-lg">
              Browse our collection of {categoryData.name.toLowerCase()}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div
              className={`lg:w-64 space-y-6 ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="font-semibold mb-4 flex items-center">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </h2>

                {/* Size Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <Badge
                        key={size}
                        variant={
                          activeFilters.sizes.includes(size)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          const newSizes = activeFilters.sizes.includes(size)
                            ? activeFilters.sizes.filter((s) => s !== size)
                            : [...activeFilters.sizes, size];
                          setActiveFilters({
                            ...activeFilters,
                            sizes: newSizes,
                          });
                        }}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <Badge
                        key={color}
                        variant={
                          activeFilters.colors.includes(color)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          const newColors = activeFilters.colors.includes(color)
                            ? activeFilters.colors.filter((c) => c !== color)
                            : [...activeFilters.colors, color];
                          setActiveFilters({
                            ...activeFilters,
                            colors: newColors,
                          });
                        }}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: ${activeFilters.priceRange[0]} - $
                    {activeFilters.priceRange[1]}
                  </label>
                  <Slider
                    defaultValue={[0, 100]}
                    max={100}
                    step={1}
                    className="mt-2"
                    onValueChange={(value) =>
                      setActiveFilters({ ...activeFilters, priceRange: value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort and Results Info */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-zinc-600">
                    Showing {products.length} results
                  </p>
                  <div className="flex items-center gap-4">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="max-w-xs"
                      value={activeFilters.searchQuery}
                      onChange={(e) =>
                        setActiveFilters({
                          ...activeFilters,
                          searchQuery: e.target.value,
                        })
                      }
                    />
                    <Select
                      value={activeFilters.sort}
                      onValueChange={handleSortChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading
                  ? // Loading skeleton
                    Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse bg-gray-200 rounded-lg aspect-square"
                      />
                    ))
                  : products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.image}
                        itemDetails={product.itemDetails}
                      />
                    ))}
              </div>

              {/* Pagination */}
              {!loading && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
