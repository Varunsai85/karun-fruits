import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, ShoppingCart, Heart, Share2, ChevronRight, ChevronLeft,
  Shield, Truck, RefreshCw, Plus, Minus, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProductCard from "@/components/common/ProductCard";
import { productService } from "@/services/productService";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const MOCK_PRODUCT = {
  id: 1,
  name: "Premium California Almonds",
  slug: "almonds",
  price: 599,
  salePrice: 499,
  weight: 500,
  unit: "g",
  rating: 4.7,
  reviewCount: 128,
  stock: 50,
  isBestseller: true,
  categoryName: "Dry Fruits",
  category: { id: 1, name: "Dry Fruits", slug: "dry-fruits" },
  description: "Our Premium California Almonds are carefully hand-selected from the finest almond orchards in California. Rich in protein, healthy fats, and essential vitamins, these almonds make for the perfect healthy snack. Each almond is naturally dried to preserve its nutritional value and crunchy texture.",
  images: [
    { id: 1, url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&h=600&fit=crop", primary: true },
    { id: 2, url: "https://images.unsplash.com/photo-1574570068036-f8f3bfb79571?w=600&h=600&fit=crop" },
    { id: 3, url: "https://images.unsplash.com/photo-1604506818543-d45ca0f04a3a?w=600&h=600&fit=crop" },
    { id: 4, url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop" },
  ],
  variants: [
    { id: 1, name: "250g", weight: 250, price: 299, salePrice: 249, stock: 30 },
    { id: 2, name: "500g", weight: 500, price: 599, salePrice: 499, stock: 50 },
    { id: 3, name: "1kg", weight: 1000, price: 1099, salePrice: 949, stock: 20 },
  ],
  nutritionFacts: "Per 28g serving: Calories 160 | Protein 6g | Fat 14g | Carbs 6g | Fiber 3.5g | Vitamin E 37% DV | Magnesium 19% DV",
};

const MOCK_REVIEWS = [
  { id: 1, user: { name: "Priya S." }, rating: 5, comment: "Excellent quality almonds! Fresh, crunchy and arrived well-packaged. Will definitely order again.", createdAt: "2024-12-01", verified: true },
  { id: 2, user: { name: "Raj K." }, rating: 4, comment: "Good quality, slightly smaller than expected but taste is great.", createdAt: "2024-11-28", verified: true },
  { id: 3, user: { name: "Anita M." }, rating: 5, comment: "Best almonds I've had! Ordering for the 3rd time now.", createdAt: "2024-11-20", verified: true },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();

  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getBySlug(slug),
    placeholderData: MOCK_PRODUCT,
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ["recommendations", product?.id],
    queryFn: () => productService.getRecommendations(product?.id),
    enabled: !!product?.id,
    placeholderData: { content: [] },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: () => productService.getReviews(product?.id),
    enabled: !!product?.id,
    placeholderData: MOCK_REVIEWS,
  });

  const p = product || MOCK_PRODUCT;
  const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.content || MOCK_REVIEWS;
  const isWishlisted = has(p.id);

  const activeVariant = selectedVariant || (p.variants?.[1] ?? null);
  const displayPrice = activeVariant?.salePrice ?? activeVariant?.price ?? p.salePrice ?? p.price;
  const originalPrice = activeVariant?.price ?? p.price;
  const discountPct = displayPrice < originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(p, quantity, activeVariant);
    toast.success(`Added ${quantity}x ${p.name} to cart!`);
  };

  const handleBuyNow = () => {
    addItem(p, quantity, activeVariant);
    navigate("/checkout");
  };

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#8B6914] mb-6">
        <Link to="/" className="hover:text-[#C8860A]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-[#C8860A]">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/products?category=${p.category?.slug}`} className="hover:text-[#C8860A]">
          {p.categoryName || p.category?.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#3D2000] font-medium truncate max-w-48">{p.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div
            className="aspect-square rounded-2xl overflow-hidden bg-[#F5ECD7] relative"
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={p.images?.[selectedImage]?.url || p.imageUrl || "/placeholder-product.jpg"}
              alt={p.name}
              className="w-full h-full object-cover"
            />
            {discountPct > 0 && (
              <Badge className="absolute top-4 left-4 bg-green-600 text-white text-sm font-semibold px-3 py-1">
                {discountPct}% OFF
              </Badge>
            )}
            {p.images?.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  disabled={selectedImage === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-[#3D2000]" />
                </button>
                <button
                  onClick={() => setSelectedImage((i) => Math.min((p.images?.length ?? 1) - 1, i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  disabled={selectedImage === (p.images?.length ?? 1) - 1}
                >
                  <ChevronRight className="w-5 h-5 text-[#3D2000]" />
                </button>
              </>
            )}
          </motion.div>
          {p.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {p.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? "border-[#C8860A]" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {p.isBestseller && (
            <Badge className="bg-[#C8860A] text-white mb-3">⭐ BESTSELLER</Badge>
          )}
          <h1 className="text-3xl font-bold text-[#3D2000] mb-3" style={{ fontFamily: "serif" }}>
            {p.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-5 h-5 ${s <= Math.round(p.rating) ? "fill-[#C8860A] text-[#C8860A]" : "text-[#E8D5B5]"}`} />
              ))}
            </div>
            <span className="font-semibold text-[#3D2000]">{p.rating?.toFixed(1)}</span>
            <span className="text-[#8B6914]">({p.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-4xl font-bold text-[#C8860A]">{formatPrice(displayPrice)}</span>
            {displayPrice < originalPrice && (
              <>
                <span className="text-xl text-[#8B6914] line-through">{formatPrice(originalPrice)}</span>
                <Badge className="bg-green-100 text-green-700 border-green-200">Save {formatPrice(originalPrice - displayPrice)}</Badge>
              </>
            )}
          </div>

          {/* Weight variants */}
          {p.variants?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#3D2000] mb-2">Pack Size</p>
              <div className="flex flex-wrap gap-2">
                {p.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      activeVariant?.id === v.id
                        ? "border-[#C8860A] bg-[#C8860A] text-white"
                        : "border-[#E8D5B5] text-[#3D2000] hover:border-[#C8860A]"
                    } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    disabled={v.stock === 0}
                  >
                    {v.name}
                    {v.salePrice && (
                      <span className="ml-1 text-xs opacity-75">· {formatPrice(v.salePrice)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm font-semibold text-[#3D2000]">Quantity</p>
            <div className="flex items-center border border-[#E8D5B5] rounded-lg overflow-hidden">
              <button
                className="px-3 py-2 hover:bg-[#F5ECD7] transition-colors"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="w-4 h-4 text-[#3D2000]" />
              </button>
              <span className="px-4 py-2 font-semibold text-[#3D2000] min-w-[3rem] text-center">{quantity}</span>
              <button
                className="px-3 py-2 hover:bg-[#F5ECD7] transition-colors"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="w-4 h-4 text-[#3D2000]" />
              </button>
            </div>
            <span className="text-sm text-[#8B6914]">
              {p.stock > 10 ? "In Stock" : p.stock > 0 ? `Only ${p.stock} left!` : "Out of Stock"}
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              className="flex-1 bg-[#C8860A] hover:bg-[#8B4513] text-white py-6 text-base font-semibold gap-2 rounded-xl"
              onClick={handleAddToCart}
              disabled={p.stock === 0}
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-[#C8860A] text-[#C8860A] hover:bg-[#C8860A] hover:text-white py-6 text-base font-semibold rounded-xl"
              onClick={handleBuyNow}
              disabled={p.stock === 0}
            >
              Buy Now
            </Button>
          </div>

          {/* Wishlist & Share */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="ghost"
              className="gap-2 text-[#8B6914] hover:text-[#C8860A]"
              onClick={() => { toggle(p); toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist"); }}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </Button>
            <Button variant="ghost" className="gap-2 text-[#8B6914] hover:text-[#C8860A]"
              onClick={() => { navigator.share?.({ title: p.name, url: window.location.href }); }}>
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button variant="ghost" className="gap-2 text-[#25D366] hover:text-[#128C7E]" asChild>
              <a href={`https://wa.me/918104956871?text=I'm interested in ${encodeURIComponent(p.name)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </Button>
          </div>

          <Separator className="bg-[#E8D5B5] mb-5" />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Truck, label: "Free Delivery", sub: "Above ₹499" },
              { icon: Shield, label: "100% Natural", sub: "No preservatives" },
              { icon: RefreshCw, label: "Easy Returns", sub: "7-day policy" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-[#F5ECD7] rounded-xl p-3">
                <Icon className="w-5 h-5 text-[#C8860A] mx-auto mb-1" />
                <p className="text-xs font-semibold text-[#3D2000]">{label}</p>
                <p className="text-xs text-[#8B6914]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description, Nutrition, Reviews */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList className="bg-[#F5ECD7] border border-[#E8D5B5] h-auto p-1 w-full sm:w-auto">
          <TabsTrigger value="description" className="data-[state=active]:bg-[#C8860A] data-[state=active]:text-white">Description</TabsTrigger>
          <TabsTrigger value="nutrition" className="data-[state=active]:bg-[#C8860A] data-[state=active]:text-white">Nutrition</TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-[#C8860A] data-[state=active]:text-white">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="bg-white border border-[#E8D5B5] rounded-2xl p-6">
            <p className="text-[#3D2000] leading-relaxed">{p.description}</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {["100% Natural", "No Preservatives", "Premium Quality", "Pan India Delivery"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-[#3D2000]">
                  <div className="w-5 h-5 rounded-full bg-[#C8860A] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6">
          <div className="bg-white border border-[#E8D5B5] rounded-2xl p-6">
            <h3 className="font-bold text-[#3D2000] mb-4">Nutrition Facts</h3>
            <p className="text-sm text-[#8B6914]">{p.nutritionFacts}</p>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="bg-white border border-[#E8D5B5] rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-[#C8860A]">{p.rating?.toFixed(1)}</div>
                <div className="flex justify-center my-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(p.rating) ? "fill-[#C8860A] text-[#C8860A]" : "text-[#E8D5B5]"}`} />
                  ))}
                </div>
                <p className="text-sm text-[#8B6914]">{p.reviewCount} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-[#8B6914] w-4">{star}</span>
                    <Star className="w-3 h-3 fill-[#C8860A] text-[#C8860A]" />
                    <div className="flex-1 bg-[#F5ECD7] rounded-full h-2">
                      <div
                        className="bg-[#C8860A] h-2 rounded-full transition-all"
                        style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm text-[#8B6914] w-4">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-[#F5ECD7] pb-5 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-[#C8860A] text-white text-sm">
                          {review.user?.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#3D2000] text-sm">{review.user?.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-[#C8860A] text-[#C8860A]" : "text-[#E8D5B5]"}`} />
                            ))}
                          </div>
                          {review.verified && (
                            <Badge className="bg-green-100 text-green-700 text-xs border-green-200 py-0">Verified Purchase</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[#8B6914]">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[#3D2000] leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {recommendationsData?.content?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-[#3D2000] mb-6" style={{ fontFamily: "serif" }}>
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendationsData.content.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
