import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { useOrders } from "../hooks/useOrders.js";
import { formatCurrency } from "../utils/currency.js";

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  stock: "",
  tags: "",
  images: "",
  isFeatured: false,
};

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { orders } = useOrders({ isAdmin: true });
  const [form, setForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState("");

  const fetchProducts = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoadingProducts(true);
    }
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products", { params: { limit: 100 } }),
        api.get("/categories"),
      ]);
      setProducts(prodRes.data?.data?.products || []);
      setCategories(catRes.data?.data?.categories || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const handleSaveProduct = async () => {
    try {
      const payload = {
        ...form,
        category: form.category || categories[0]?._id || "",
        images: form.images ? [form.images] : [],
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
        toast.success("Product updated.");
      } else {
        await api.post("/products", payload);
        toast.success("Product created.");
      }

      setForm(emptyProductForm);
      setEditingProductId("");
      await fetchProducts(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin actions need the API server and an admin account.");
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || "",
      category: product.category?._id || "",
      stock: product.stock,
      tags: (product.tags || []).join(", "),
      images: product.images?.[0]?.url || "",
      isFeatured: Boolean(product.isFeatured),
    });
  };

  const handleArchive = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product archived.");
      await fetchProducts(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive product.");
    }
  };

  const handleOrderStatus = async (orderId, nextStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { orderStatus: nextStatus });
      toast.success("Order status updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update order status.");
    }
  };

  return (
    <section className="page-section space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Products", products.length],
          ["Orders", orders.length],
          ["Revenue", formatCurrency(totalRevenue)],
        ].map(([label, value]) => (
          <div key={label} className="surface-panel px-6 py-6">
            <p className="eyebrow mb-2">{label}</p>
            <p className="display-title text-3xl font-semibold text-ink-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-panel p-6">
          <h1 className="display-title text-3xl font-semibold text-ink-950">
            {editingProductId ? "Edit product" : "Create product"}
          </h1>
          <div className="mt-6 grid gap-4">
            {[
              ["name", "Product name"],
              ["description", "Description"],
              ["price", "Price"],
              ["discountPrice", "Discount price"],
              ["stock", "Stock"],
              ["tags", "Tags (comma separated)"],
              ["images", "Image URL"],
            ].map(([key, label]) => (
              <input
                key={key}
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                placeholder={label}
              />
            ))}

            <select
              value={form.category || categories[0]?._id || ""}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
            >
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))}
              />
              Featured product
            </label>

            <button
              type="button"
              className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-sand-50"
              onClick={handleSaveProduct}
            >
              {editingProductId ? "Save changes" : "Create product"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="surface-panel p-6">
            <h2 className="display-title text-2xl font-semibold text-ink-950">Product table</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProducts ? (
                    <tr><td colSpan={4} className="py-6 text-center text-sm text-slate-400">Loading products...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={4} className="py-6 text-center text-sm text-slate-400">No products found.</td></tr>
                  ) : products.map((product) => (
                    <tr key={product._id} className="border-t border-slate-200">
                      <td className="py-4 font-semibold text-ink-950">{product.name}</td>
                      <td className="py-4 text-slate-600">{formatCurrency(product.discountPrice ?? product.price)}</td>
                      <td className="py-4 text-slate-600">{product.stock}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-900"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-900"
                            onClick={() => handleArchive(product._id)}
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="surface-panel p-6">
            <h2 className="display-title text-2xl font-semibold text-ink-950">Order management</h2>
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-[24px] border border-slate-200 bg-sand-50 px-5 py-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-ink-950">{order._id}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()} · {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <select
                      value={order.orderStatus}
                      onChange={(event) => handleOrderStatus(order._id, event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
