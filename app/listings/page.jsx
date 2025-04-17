"use client";

import { useState, useEffect, Suspense } from "react";
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
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { categories } from "@/constants/categories";
import { sortOptions } from "@/constants/sort-options";
import { sizes, colors } from "@/constants/product-options";

// Loading component for suspense
function ListingsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-200 rounded-lg aspect-square"
        />
      ))}
    </div>
  );
}

// Main content component wrapped with suspense
function ListingsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  });
  const [activeFilters, setActiveFilters] = useState({
    category: "all",
    sizes: [],
    colors: [],
    priceRange: [0, 100],
    sort: "newest",
    searchQuery: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    fetchCategoryCounts();
    const page = parseInt(searchParams.get("page")) || 1;
    fetchProducts(page);
  }, [searchParams]);

  const fetchCategoryCounts = async () => {
    try {
      const response = await fetch("/api/categories/count");
      const data = await response.json();
      if (data.categoryCounts) {
        setCategoryCounts(data.categoryCounts);
      }
    } catch (error) {
      console.error("Error fetching category counts:", error);
    }
  };

  const fetchProducts = async (page) => {
    try {
      setLoading(true);

      // Construct search parameters
      const params = new URLSearchParams({
        q: activeFilters.searchQuery,
        category:
          activeFilters.category === "all" ? "" : activeFilters.category,
        minPrice: activeFilters.priceRange[0],
        maxPrice: activeFilters.priceRange[1],
        page: page,
      });

      // Add colors if any are selected
      if (activeFilters.colors.length > 0) {
        params.append("colors", activeFilters.colors.join(","));
      }

      // Handle sort parameters
      switch (activeFilters.sort) {
        case "newest":
          params.append("sortBy", "created_at");
          params.append("sortOrder", "DESC");
          break;
        case "price-low":
          params.append("sortBy", "price");
          params.append("sortOrder", "ASC");
          break;
        case "price-high":
          params.append("sortBy", "price");
          params.append("sortOrder", "DESC");
          break;
        case "popular":
          params.append("sortBy", "total_sold");
          params.append("sortOrder", "DESC");
          break;
        default:
          params.append("sortBy", "created_at");
          params.append("sortOrder", "DESC");
      }

      const response = await fetch(`/api/products/search?${params}`);
      const data = await response.json();

      if (!data.products || !Array.isArray(data.products)) {
        console.error("Unexpected response format:", data);
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

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    fetchProducts(page);
  }, [
    searchParams,
    activeFilters.searchQuery,
    activeFilters.category,
    activeFilters.priceRange,
    activeFilters.sort,
  ]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      router.push(`/listings?page=${newPage}`);
    }
  };

  const handleSortChange = (value) => {
    setActiveFilters({ ...activeFilters, sort: value });
    // Reset to page 1 when sort changes
    router.push("/listings?page=1");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10"
              value={activeFilters.searchQuery}
              onChange={(e) =>
                setActiveFilters({
                  ...activeFilters,
                  searchQuery: e.target.value,
                })
              }
            />
          </div>
          <Button type="submit" className="bg-[#0064B1]">
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={activeFilters.category}
                  onChange={(e) =>
                    setActiveFilters({
                      ...activeFilters,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={activeFilters.priceRange[0]}
                    onChange={(e) =>
                      setActiveFilters({
                        ...activeFilters,
                        priceRange: [
                          e.target.value,
                          activeFilters.priceRange[1],
                        ],
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={activeFilters.priceRange[1]}
                    onChange={(e) =>
                      setActiveFilters({
                        ...activeFilters,
                        priceRange: [
                          activeFilters.priceRange[0],
                          e.target.value,
                        ],
                      })
                    }
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={activeFilters.sort}
                  onChange={(e) =>
                    setActiveFilters({
                      ...activeFilters,
                      sort: e.target.value,
                    })
                  }
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="mb-12">
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
                      {categoryCounts[category.slug] || 0} items
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <Button
        variant="outline"
        className="lg:hidden mb-4 w-full"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="mr-2 h-4 w-4" />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Sort and Results Info */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-zinc-600">
                Showing {products.length} of {pagination.totalProducts} results
              </p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-gray-200 rounded-lg aspect-square"
                />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  itemDetails={product.itemDetails}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
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
    </>
  );
}

export default function ListingsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-[#0064B1]">
              All UTA Merchandise
            </h1>
            <p className="text-zinc-600 text-lg">
              Browse our complete collection of official UTA gear
            </p>
          </div>

          <Suspense fallback={<ListingsLoading />}>
            <ListingsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
