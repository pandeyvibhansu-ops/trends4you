import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useActor } from "../hooks/useActor";

const ADMIN_PASSWORD = "admin123";
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password. Please try again.");
    }
  }

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <div
          className="bg-white rounded-2xl shadow-card p-8 w-full max-w-sm"
          data-ocid="admin.panel"
        >
          <div className="text-center mb-6">
            <span className="text-3xl font-bold" style={{ color: "#2874f0" }}>
              Trends<span style={{ color: "#ffe500" }}>4</span>You
            </span>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              Admin Panel
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="pw-input"
                className="text-sm font-semibold text-gray-700 block mb-1"
              >
                Password
              </label>
              <input
                id="pw-input"
                type="password"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                placeholder="Enter admin password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                data-ocid="admin.input"
              />
              {pwError && (
                <p
                  className="text-red-500 text-xs mt-1 font-medium"
                  data-ocid="admin.error_state"
                >
                  {pwError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-bold text-white text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2874f0" }}
              data-ocid="admin.submit_button"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              style={{ color: "#2874f0" }}
              data-ocid="admin.link"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { actor, isFetching } = useActor();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    imageUrl: "",
  });
  const [addForm, setAddForm] = useState({ name: "", price: "", imageUrl: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);

  const loadProducts = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const p = await actor.getAllProducts();
      setProducts(p);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor && !isFetching) {
      loadProducts();
    }
  }, [actor, isFetching, loadProducts]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    if (!addForm.name || !addForm.price || !addForm.imageUrl) {
      toast.error("Please fill all fields");
      return;
    }
    setAddLoading(true);
    try {
      await actor.addProduct({
        name: addForm.name,
        price: BigInt(Math.round(Number.parseFloat(addForm.price))),
        imageUrl: addForm.imageUrl,
      });
      setAddForm({ name: "", price: "", imageUrl: "" });
      await loadProducts();
      toast.success("Product added!");
    } catch {
      toast.error("Failed to add product");
    } finally {
      setAddLoading(false);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: String(Number(product.price)),
      imageUrl: product.imageUrl,
    });
  }

  async function saveEdit(product: Product) {
    if (!actor) return;
    try {
      await actor.updateProduct({
        id: product.id,
        name: editForm.name,
        price: BigInt(Math.round(Number.parseFloat(editForm.price))),
        imageUrl: editForm.imageUrl,
      });
      setEditingId(null);
      await loadProducts();
      toast.success("Product updated!");
    } catch {
      toast.error("Failed to update product");
    }
  }

  async function handleDelete(id: bigint) {
    if (!actor) return;
    try {
      await actor.deleteProduct(id);
      setDeleteConfirm(null);
      await loadProducts();
      toast.success("Product deleted!");
    } catch {
      toast.error("Failed to delete product");
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: "#2874f0" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <Link
            to="/"
            className="flex items-center gap-1 text-white text-sm font-medium hover:text-yellow-300 transition-colors"
            data-ocid="admin.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Add Product Form */}
        <section
          className="bg-white rounded-2xl shadow-card p-6"
          data-ocid="admin.panel"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Plus className="w-5 h-5" style={{ color: "#2874f0" }} />
            Add New Product
          </h2>
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="lg:col-span-1">
              <label
                htmlFor="add-name"
                className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1"
              >
                Name
              </label>
              <input
                id="add-name"
                type="text"
                placeholder="Product name"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <label
                htmlFor="add-price"
                className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1"
              >
                Price (₹)
              </label>
              <input
                id="add-price"
                type="number"
                placeholder="e.g. 999"
                value={addForm.price}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, price: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                data-ocid="admin.input"
              />
            </div>
            <div className="lg:col-span-1">
              <label
                htmlFor="add-image"
                className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1"
              >
                Image URL
              </label>
              <input
                id="add-image"
                type="text"
                placeholder="https://..."
                value={addForm.imageUrl}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                data-ocid="admin.input"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={addLoading}
                className="w-full py-2.5 rounded-lg font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#2874f0" }}
                data-ocid="admin.submit_button"
              >
                {addLoading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </section>

        {/* Products Table */}
        <section
          className="bg-white rounded-2xl shadow-card p-6"
          data-ocid="admin.table"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-5">
            All Products ({products.length})
          </h2>

          {loading ? (
            <div className="space-y-3" data-ocid="admin.loading_state">
              {SKELETON_KEYS.map((key) => (
                <div
                  key={key}
                  className="h-14 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div
              className="text-center py-10 text-gray-400"
              data-ocid="admin.empty_state"
            >
              <p className="font-medium">No products yet. Add one above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-ocid="admin.table">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-3 pr-4">Image</th>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Price</th>
                    <th className="pb-3 pr-4">Image URL</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product, i) => (
                    <tr
                      key={String(product.id)}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      {editingId === product.id ? (
                        <>
                          <td className="py-3 pr-4">
                            <img
                              src={editForm.imageUrl || product.imageUrl}
                              alt="preview"
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  name: e.target.value,
                                }))
                              }
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                              data-ocid="admin.input"
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <input
                              type="number"
                              value={editForm.price}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  price: e.target.value,
                                }))
                              }
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              data-ocid="admin.input"
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <input
                              type="text"
                              value={editForm.imageUrl}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  imageUrl: e.target.value,
                                }))
                              }
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                              data-ocid="admin.input"
                            />
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(product)}
                                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                data-ocid={`admin.save_button.${i + 1}`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                                data-ocid={`admin.cancel_button.${i + 1}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 pr-4">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          </td>
                          <td className="py-3 pr-4 font-semibold text-gray-800">
                            {product.name}
                          </td>
                          <td
                            className="py-3 pr-4 font-bold"
                            style={{ color: "#2874f0" }}
                          >
                            {formatPrice(product.price)}
                          </td>
                          <td className="py-3 pr-4 text-gray-400 truncate max-w-[180px]">
                            <span title={product.imageUrl}>
                              {product.imageUrl.slice(0, 40)}...
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(product)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                style={{ color: "#2874f0" }}
                                data-ocid={`admin.edit_button.${i + 1}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {deleteConfirm === product.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(product.id)}
                                    className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    data-ocid={`admin.confirm_button.${i + 1}`}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    data-ocid={`admin.cancel_button.${i + 1}`}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirm(product.id)}
                                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                  data-ocid={`admin.delete_button.${i + 1}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
