import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SiInstagram } from "react-icons/si";
import type { Product } from "../backend";
import { useActor } from "../hooks/useActor";

interface CartItem {
  product: Product;
  quantity: number;
}

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

export default function StoreFront() {
  const { actor, isFetching } = useActor();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getAllProducts()
      .then((p) => {
        setProducts(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, isFetching]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: bigint) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId: bigint, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function handleCheckout() {
    const lines = cart
      .map(
        (item) =>
          `• ${item.product.name} x${item.quantity} = ${formatPrice(BigInt(Number(item.product.price) * item.quantity))}`,
      )
      .join("\n");
    const message = `Hello! I'd like to order:\n${lines}\nTotal: ₹${cartTotal.toLocaleString("en-IN")}\n\nPlease confirm my order. Thank you!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918303379462?text=${encoded}`, "_blank");
    setCart([]);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f5f5f5" }}
    >
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: "#2874f0" }}
        data-ocid="header.section"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Brand */}
          <Link to="/" className="flex-shrink-0" data-ocid="header.link">
            <span className="text-2xl font-bold text-white tracking-tight">
              Trends<span style={{ color: "#ffe500" }}>4</span>You
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-full bg-white text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none shadow-sm"
              data-ocid="header.search_input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              to="/admin"
              className="text-white text-sm font-semibold hover:text-yellow-300 transition-colors"
              data-ocid="header.link"
            >
              Admin
            </Link>
            <a
              href="https://www.instagram.com/vibhansu_pandit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-300 transition-colors"
              data-ocid="header.link"
            >
              <SiInstagram className="w-5 h-5" />
            </a>
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: "#ffe500", color: "#111" }}
                  data-ocid="cart.toggle"
                >
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Product Grid */}
        <section data-ocid="products.section">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Our Collection
          </h2>

          {loading ? (
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              }}
            >
              {SKELETON_KEYS.map((key, i) => (
                <div
                  key={key}
                  className="bg-white rounded-xl shadow-card animate-pulse"
                  data-ocid={`products.item.${i + 1}`}
                >
                  <div
                    className="bg-gray-200 rounded-t-xl"
                    style={{ aspectRatio: "4/3" }}
                  />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-20 text-gray-500"
              data-ocid="products.empty_state"
            >
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              }}
            >
              {filtered.map((product, i) => (
                <ProductCard
                  key={String(product.id)}
                  product={product}
                  onAddToCart={addToCart}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* Cart Section */}
        {cart.length > 0 && (
          <section className="mt-12" data-ocid="cart.section">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ShoppingCart
                  className="w-6 h-6"
                  style={{ color: "#2874f0" }}
                />
                Your Cart
              </h2>

              <div className="space-y-3">
                {cart.map((item, i) => (
                  <div
                    key={String(item.product.id)}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    data-ocid={`cart.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.product.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm font-bold hover:bg-gray-100 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm font-bold hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="w-24 text-right font-bold text-gray-800">
                        {formatPrice(
                          BigInt(Number(item.product.price) * item.quantity),
                        )}
                      </span>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                        data-ocid={`cart.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Checkout */}
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Order Total</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: "#2874f0" }}
                  >
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="px-8 py-3 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "#222" }}
                  data-ocid="cart.submit_button"
                >
                  Checkout via WhatsApp →
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#222" }} className="py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white text-sm font-medium">
            © 2026 Trends<span style={{ color: "#ffe500" }}>4</span>You. All
            rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/vibhansu_pandit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-yellow-300 transition-colors text-sm"
            >
              <SiInstagram className="w-5 h-5" />
              @vibhansu_pandit
            </a>
          </div>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 text-xs hover:text-gray-200 transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
  index,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-xl overflow-hidden flex flex-col"
      style={{
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.16)"
          : "0 2px 8px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid={`products.item.${index}`}
    >
      <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          style={{
            transition: "transform 0.3s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-gray-800 text-base leading-tight">
          {product.name}
        </h3>
        <p className="text-xl font-bold" style={{ color: "#111" }}>
          {`₹${Number(product.price).toLocaleString("en-IN")}`}
        </p>
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          className="mt-auto w-full py-2.5 rounded-lg font-bold text-sm transition-all"
          style={{
            backgroundColor: btnHovered ? "#ffe500" : "#2874f0",
            color: btnHovered ? "#111" : "#fff",
            transition: "background-color 0.2s ease, color 0.2s ease",
          }}
          data-ocid={`products.button.${index}`}
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}
