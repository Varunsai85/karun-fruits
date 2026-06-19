import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { addItem }           = useCartStore();
  const { toggle, has }       = useWishlistStore();
  const wishlisted            = has(product.id);

  const currentPrice = product.salePrice ?? product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discountPct = originalPrice
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem({ ...product, quantity: 1 });
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <motion.div
        className="relative bg-[#162018] border border-[#2A3A2C] rounded-2xl overflow-hidden"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#1D2B1F]">
          <img
            src={product.imageUrl || product.images?.[0]?.url || "/placeholder-product.jpg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPct >= 5 && (
              <span className="label-luxury bg-[#C17A35] text-white px-2 py-0.5 rounded-md text-[10px]">
                {discountPct}% OFF
              </span>
            )}
            {product.isNew && (
              <span className="label-luxury bg-[#162018] text-[#F5F0E8] border border-[#2A3A2C] px-2 py-0.5 rounded-md text-[10px]">
                New
              </span>
            )}
            {product.bestseller && (
              <span className="label-luxury bg-[#1D2B1F] text-[#C17A35] border border-[#2A3A2C] px-2 py-0.5 rounded-md text-[10px]">
                Bestseller
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#162018]/80 border border-[#2A3A2C] flex items-center justify-center text-[#9AAA9C] hover:text-[#C17A35] hover:border-[#C17A35] transition-all shadow-sm"
          >
            <Heart
              className="w-3.5 h-3.5"
              fill={wishlisted ? "#C17A35" : "none"}
              stroke={wishlisted ? "#C17A35" : "currentColor"}
            />
          </button>

          {/* Add to cart overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute inset-x-0 bottom-0 p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
              >
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C17A35] hover:bg-[#A86929] text-white text-sm font-light tracking-wide rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category?.name && (
            <span className="label-luxury text-[#5A6A5C] block mb-1.5">{product.category.name}</span>
          )}
          <h3 className="font-heading text-[#F5F0E8] text-lg font-light leading-tight mb-2 group-hover:text-[#C17A35] transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map((n) => (
                  <Star
                    key={n}
                    className="w-3 h-3"
                    fill={n <= Math.round(product.rating) ? "#C17A35" : "none"}
                    stroke={n <= Math.round(product.rating) ? "#C17A35" : "#2A3A2C"}
                  />
                ))}
              </div>
              <span className="text-xs text-[#7A8F7C]">({product.reviewCount ?? 0})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-[#F5F0E8] text-xl font-medium">{formatPrice(currentPrice)}</span>
            {originalPrice && (
              <span className="text-sm text-[#5A6A5C] line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>

          {product.weight && (
            <span className="text-xs text-[#7A8F7C] mt-1 block">{product.weight}{product.unit}</span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
