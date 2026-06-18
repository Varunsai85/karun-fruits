import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, Grid2X2, List, X, ChevronDown, TrendingUp, Star, Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProductCard from "@/components/common/ProductCard";
import { productService } from "@/services/productService";

const SORT_OPTIONS = [
  { value: "popularity",  label: "Popularity",        icon: TrendingUp },
  { value: "price-asc",   label: "Price: Low to High", icon: ArrowUp },
  { value: "price-desc",  label: "Price: High to Low", icon: ArrowDown },
  { value: "newest",      label: "Newest First",       icon: Sparkles },
  { value: "rating",      label: "Top Rated",          icon: Star },
];

const CATEGORIES = [
  { id: "dry-fruits",     label: "Dry Fruits" },
  { id: "seeds",          label: "Seeds" },
  { id: "healthy-snacks", label: "Healthy Snacks" },
  { id: "gift-boxes",     label: "Gift Boxes" },
  { id: "combo-packs",    label: "Combo Packs" },
];

const MOCK_PRODUCTS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: ["Premium California Almonds","Whole Cashews W240","Iranian Pistachios","Medjool Dates","Pumpkin Seeds","Dried Figs","Walnut Kernels","Makhana (Fox Nuts)","Dried Apricots","Cranberries","Chia Seeds","Flax Seeds","Sunflower Seeds","Raisins","Mixed Dry Fruits","Cashew Almond Mix","Dates & Walnut Box","Healthy Snack Mix","Premium Gift Box","Festival Combo Pack"][i],
  slug: String(i + 1),
  price: [599,699,849,499,349,449,649,299,399,299,199,149,199,249,799,899,599,449,1499,1199][i],
  originalPrice: [799,899,null,null,399,null,null,null,null,null,null,null,null,299,null,null,null,null,1799,1399][i],
  avgRating: 4 + Math.random() * 1,
  reviewCount: Math.floor(Math.random() * 200) + 20,
  isBestSeller: i < 5,
  isNew: i >= 8 && i < 12,
  imageUrl: `https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop`,
  category: { name: ["Dry Fruits","Dry Fruits","Dry Fruits","Dry Fruits","Seeds","Dry Fruits","Dry Fruits","Healthy Snacks","Dry Fruits","Dry Fruits","Seeds","Seeds","Seeds","Dry Fruits","Mixed","Mixed","Gift Boxes","Healthy Snacks","Gift Boxes","Combo Packs"][i] },
}));

function FilterPanel({ selectedCategories, toggleCategory, displayRange, setDisplayRange, setPriceRange, setPage, clearFilters }) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="label-luxury text-[#C17A35] mb-4">Categories</h3>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
                className="border-[#2A3A2C] data-[state=checked]:bg-[#1E4620] data-[state=checked]:border-[#C17A35]"
              />
              <span className="text-sm text-[#9AAA9C] group-hover:text-[#F5F0E8] transition-colors font-light">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#2A3A2C] pt-6">
        <h3 className="label-luxury text-[#C17A35] mb-4">Price Range</h3>
        <p className="text-sm text-[#9AAA9C] mb-4 font-light">₹{displayRange[0]} – ₹{displayRange[1]}</p>
        <Slider
          value={displayRange}
          onValueChange={setDisplayRange}
          onValueCommitted={(val) => { setPriceRange(val); setPage(0); }}
          min={0} max={2000} step={50}
          className="[&>[data-slot=slider-range]]:bg-[#1E4620]"
        />
      </div>

      <div className="border-t border-[#2A3A2C] pt-6">
        <h3 className="label-luxury text-[#C17A35] mb-4">Availability</h3>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="border-[#2A3A2C] data-[state=checked]:bg-[#1E4620] data-[state=checked]:border-[#C17A35]" />
          <span className="text-sm text-[#9AAA9C] font-light">In Stock Only</span>
        </label>
      </div>

      <button onClick={clearFilters} className="w-full py-2.5 border border-[#2A3A2C] text-[#9AAA9C] hover:border-[#C17A35] hover:text-[#C17A35] text-sm font-light tracking-wide rounded-xl transition-all">
        Clear All Filters
      </button>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange]             = useState([0, 2000]);
  const [displayRange, setDisplayRange]         = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy]                     = useState("popularity");
  const [viewMode, setViewMode]                 = useState("grid");
  const [page, setPage]                         = useState(0);

  const searchQuery  = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  useEffect(() => {
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  const { data, isLoading } = useQuery({
    queryKey: ["products", { search: searchQuery, categories: selectedCategories, priceRange, sortBy, page }],
    queryFn: () =>
      productService.getAll({
        search: searchQuery,
        category: selectedCategories.join(","),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort: sortBy,
        page,
        size: 12,
      }),
    staleTime: 2 * 60 * 1000,
    placeholderData: { content: MOCK_PRODUCTS, totalElements: 20, totalPages: 2 },
  });

  const products = useMemo(() => {
    const raw = data?.content || MOCK_PRODUCTS;

    let filtered = raw.filter(p => {
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedCategories.length > 0) {
        const catLabel = CATEGORIES.find(c => c.id === selectedCategories.find(s => s === c.id))?.label;
        const matches = selectedCategories.some(slug => {
          const label = CATEGORIES.find(c => c.id === slug)?.label || "";
          return p.category?.name?.toLowerCase() === label.toLowerCase();
        });
        if (!matches) return false;
      }
      if (searchQuery) {
        if (!p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "price-asc")  return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating")     return b.avgRating - a.avgRating;
      if (sortBy === "newest")     return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return b.reviewCount - a.reviewCount; // popularity
    });

    return filtered;
  }, [data, priceRange, selectedCategories, searchQuery, sortBy]);

  const toggleCategory = (id) => {
    setSelectedCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 2000]);
    setDisplayRange([0, 2000]);
    setSortBy("popularity");
    setSearchParams({});
  };


  return (
    <div className="min-h-screen bg-[#0D1A10]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          {searchQuery && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-[#9AAA9C] font-light">Search results for:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#162018] border border-[#2A3A2C] text-[#F5F0E8] text-sm rounded-full">
                {searchQuery}
                <button onClick={() => setSearchParams({})} className="text-[#9AAA9C] hover:text-[#C17A35]"><X className="w-3 h-3" /></button>
              </span>
            </div>
          )}
          <div className="flex items-end justify-between">
            <div>
              <span className="label-luxury text-[#C17A35] block mb-2">
                {categoryParam ? CATEGORIES.find(c => c.id === categoryParam)?.label : "All Products"}
              </span>
              <h1 className="font-heading text-[#F5F0E8] text-4xl font-light">
                {categoryParam ? CATEGORIES.find(c => c.id === categoryParam)?.label || "Products" : "Our Collection"}
              </h1>
            </div>
            <span className="text-sm text-[#9AAA9C] font-light">{products.length} products</span>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6">
              <h2 className="font-heading text-[#F5F0E8] text-xl font-light mb-6">Filters</h2>
              <FilterPanel selectedCategories={selectedCategories} toggleCategory={toggleCategory} displayRange={displayRange} setDisplayRange={setDisplayRange} setPriceRange={setPriceRange} setPage={setPage} clearFilters={clearFilters} />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[#2A3A2C] text-[#9AAA9C] hover:border-[#C17A35] hover:text-[#F5F0E8] text-sm font-light rounded-xl transition-all">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                    {selectedCategories.length > 0 && (
                      <span className="w-5 h-5 bg-[#C17A35] text-white text-xs rounded-full flex items-center justify-center">
                        {selectedCategories.length}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-[#0D1A10] border-r border-[#2A3A2C]">
                  <SheetHeader>
                    <SheetTitle className="text-[#F5F0E8] font-heading font-light text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6"><FilterPanel selectedCategories={selectedCategories} toggleCategory={toggleCategory} displayRange={displayRange} setDisplayRange={setDisplayRange} setPriceRange={setPriceRange} setPage={setPage} clearFilters={clearFilters} /></div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-3 ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#162018] border border-[#2A3A2C] hover:border-[#C17A35] text-[#D0D8D2] hover:text-[#F5F0E8] text-sm font-light rounded-xl transition-all group">
                      {(() => { const opt = SORT_OPTIONS.find(o => o.value === sortBy); const Icon = opt?.icon; return Icon ? <Icon className="w-3.5 h-3.5 text-[#C17A35]" /> : null; })()}
                      <span>{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#5A6A5C] group-data-[state=open]:rotate-180 transition-transform duration-200" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-[#162018] border-[#2A3A2C] p-1.5 rounded-xl shadow-xl">
                    {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => setSortBy(value)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          sortBy === value
                            ? "bg-[#1E4620] text-[#F5F0E8]"
                            : "text-[#9AAA9C] hover:bg-[#1D2B1F] hover:text-[#F5F0E8]"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${sortBy === value ? "text-[#C17A35]" : "text-[#5A6A5C]"}`} />
                        <span className="text-sm font-light">{label}</span>
                        {sortBy === value && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C17A35]" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="hidden sm:flex border border-[#2A3A2C] rounded-lg overflow-hidden">
                  <button className={`p-2 transition-colors ${viewMode === "grid" ? "bg-[#1E4620] text-[#F5F0E8]" : "text-[#9AAA9C] hover:text-[#9AAA9C]"}`} onClick={() => setViewMode("grid")}>
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                  <button className={`p-2 transition-colors ${viewMode === "list" ? "bg-[#1E4620] text-[#F5F0E8]" : "text-[#9AAA9C] hover:text-[#9AAA9C]"}`} onClick={() => setViewMode("list")}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCategories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E4620] border border-[#2A3A2C] text-[#C17A35] text-sm rounded-full font-light">
                    {CATEGORIES.find(c => c.id === cat)?.label}
                    <button onClick={() => toggleCategory(cat)} className="text-[#9AAA9C] hover:text-[#F5F0E8]"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#162018] border border-[#2A3A2C] rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-[#1D2B1F]" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-[#1D2B1F] rounded w-1/3" />
                      <div className="h-5 bg-[#1D2B1F] rounded w-3/4" />
                      <div className="h-4 bg-[#1D2B1F] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-5">🔍</div>
                <h3 className="font-heading text-[#F5F0E8] text-2xl font-light mb-2">No products found</h3>
                <p className="text-[#9AAA9C] mb-7 font-light">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="px-8 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className={`grid gap-4 md:gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`} layout>
                  {products.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} layout>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {data?.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-5 py-2 border border-[#2A3A2C] text-[#9AAA9C] hover:border-[#C17A35] hover:text-[#F5F0E8] disabled:opacity-40 text-sm font-light rounded-full transition-all">
                  Previous
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-full text-sm font-light transition-all ${page === i ? "bg-[#C17A35] text-white" : "border border-[#2A3A2C] text-[#9AAA9C] hover:border-[#C17A35]"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))} disabled={page >= data.totalPages - 1} className="px-5 py-2 border border-[#2A3A2C] text-[#9AAA9C] hover:border-[#C17A35] hover:text-[#F5F0E8] disabled:opacity-40 text-sm font-light rounded-full transition-all">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
