"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ShoppingCart, Search, Filter, Tag, Star, Package, X, Plus, Minus, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  stock: number;
  featured: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || url.trim() === "") return false;
  try {
    if (url.startsWith("/")) return true;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/settings").then((res) => res.json()).catch(() => ({})),
    ])
      .then(([productsData, settingsData]) => {
          setProducts(productsData.products || []);
          setCheckoutUrl(settingsData.siteSettings?.checkoutUrl || settingsData.checkoutUrl || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || product.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  const handleCheckout = () => {
    console.log("Checkout clicked, URL:", checkoutUrl);
    if (!checkoutUrl) {
      toast.error("Checkout URL belum diatur");
      return;
    }
    
    // Try message first for sandbox
    try {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: checkoutUrl } }, "*");
    } catch (e) {
      console.error("PostMessage failed, falling back to window.open", e);
    }
    
    // Fallback for direct access
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Digital <span className="gradient-text">Shop</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Premium digital products to boost your development workflow
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-full bg-card border-border"
            />
          </div>
          <Button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[hsl(var(--theme-primary))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Belum tersedia</p>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-all ${
                  !selectedCategory
                    ? "bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Filter className="w-4 h-4" />
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.5)] transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                        {isValidImageUrl(product.image) ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      {product.featured && (
                        <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      {product.originalPrice && (
                        <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs text-[hsl(var(--theme-primary))] font-medium">
                        {product.category}
                      </span>
                      <h3 className="text-lg font-bold mt-1 mb-2 group-hover:text-[hsl(var(--theme-primary))] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[hsl(var(--theme-primary))]">
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          className="rounded-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setIsCartOpen(false)}
              />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed z-50 top-20 bottom-4 left-4 right-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[80vh] bg-background rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden"
                >
                <div className="flex items-center justify-between p-5 border-b border-border bg-card/50">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                    Shopping Cart
                    {cartCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--theme-primary))] text-white text-sm">
                        {cartCount}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <Package className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsCartOpen(false)}
                        className="mt-4 rounded-full"
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                          <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex gap-4 p-4 rounded-xl bg-card border border-border"
                          >
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              {isValidImageUrl(item.image) ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--theme-primary)/0.2)] to-[hsl(var(--theme-accent)/0.2)] flex items-center justify-center">
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                            <p className="text-[hsl(var(--theme-primary))] font-bold">${item.price}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQuantity(item._id, -1)}
                                className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, 1)}
                                className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors ml-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-5 border-t border-border bg-card/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${cartTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[hsl(var(--theme-primary))]">${cartTotal}</span>
                    </div>
<button
                          type="button"
                          onClick={handleCheckout}
                          disabled={!checkoutUrl}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white font-semibold text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Checkout
                        </button>
                      {!checkoutUrl && (
                        <p className="text-xs text-center text-muted-foreground">
                          Checkout URL belum diatur oleh admin
                        </p>
                      )}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
