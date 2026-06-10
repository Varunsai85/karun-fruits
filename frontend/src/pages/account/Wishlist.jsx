import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function Wishlist() {
  const { items, remove } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const moveToCart = (product) => {
    addItem(product);
    remove(product.id);
    toast.success("Moved to cart!");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-7">
        <h2 className="font-heading text-[#F5F0E8] text-2xl font-light mb-7">
          My Wishlist <span className="text-[#9AAA9C] font-light text-lg">({items.length})</span>
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-14 h-14 text-[#5A6A5C] mx-auto mb-4" />
            <h3 className="font-heading text-[#F5F0E8] text-xl font-light mb-2">Your wishlist is empty</h3>
            <p className="text-[#9AAA9C] mb-6 font-light">Save products you love to revisit later</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-7 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((product) => (
              <div key={product.id} className="flex gap-4 border border-[#2A3A2C] rounded-xl p-4 hover:border-[#C17A35]/40 transition-colors">
                <Link to={`/products/${product.slug || product.id}`} className="w-20 h-20 rounded-lg overflow-hidden bg-[#1D2B1F] flex-shrink-0">
                  <img src={product.imageUrl || "/placeholder-product.jpg"} alt={product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product.slug || product.id}`} className="font-light text-[#F5F0E8] hover:text-[#C17A35] transition-colors text-sm line-clamp-2">
                    {product.name}
                  </Link>
                  <p className="font-heading text-[#C17A35] text-lg font-light mt-1">{formatPrice(product.price)}</p>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={() => moveToCart(product)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#1E4620] hover:bg-[#C17A35] text-[#F5F0E8] text-xs font-light rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add to Cart
                    </button>
                    <button
                      onClick={() => { remove(product.id); toast("Removed from wishlist"); }}
                      className="p-1.5 text-[#5A6A5C] hover:text-red-400 transition-colors rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
