import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";
import { useOrders } from "../hooks/useOrders.js";
import { formatCurrency } from "../utils/currency.js";

export default function DashboardPage() {
  const { user, updateProfile } = useAuth();
  const { orders, error } = useOrders();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    avatar: user?.avatar || "",
    address: user?.address?.length
      ? user.address
      : [
          {
            label: "Home",
            line1: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phone: "",
            isDefault: true,
          },
        ],
  });

  const saveProfile = async () => {
    try {
      await updateProfile(profile);
    } catch {
      toast.error("Profile updates require the API server.");
    }
  };

  return (
    <section className="page-section space-y-8">
      <div className="surface-panel px-8 py-8">
        <p className="eyebrow mb-3">Dashboard</p>
        <h1 className="display-title text-4xl font-semibold text-ink-950">
          Welcome back, {user?.name?.split(" ")[0] || "shopper"}
        </h1>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-dashed border-honey-400 bg-white/70 px-5 py-4 text-sm text-slate-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-panel p-6">
          <h2 className="display-title text-2xl font-semibold text-ink-950">Order history</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t border-slate-200">
                    <td className="py-4 font-semibold text-ink-950">{order._id}</td>
                    <td className="py-4 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 capitalize text-slate-600">{order.orderStatus}</td>
                    <td className="py-4 text-slate-600">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="surface-panel p-6">
            <h2 className="display-title text-2xl font-semibold text-ink-950">Profile edit</h2>
            <div className="mt-6 grid gap-4">
              <input
                value={profile.name}
                onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                placeholder="Name"
              />
              <input
                value={profile.avatar}
                onChange={(event) => setProfile((current) => ({ ...current, avatar: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                placeholder="Avatar URL"
              />
              <button
                type="button"
                className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-sand-50"
                onClick={saveProfile}
              >
                Save profile
              </button>
            </div>
          </div>

          <div className="surface-panel p-6">
            <h2 className="display-title text-2xl font-semibold text-ink-950">Address book</h2>
            <div className="mt-6 grid gap-4">
              {(profile.address || []).map((address, index) => (
                <div key={index} className="rounded-[24px] border border-slate-200 bg-sand-50 px-5 py-4 text-sm leading-7 text-slate-600">
                  <p className="font-semibold text-ink-950">{address.label}</p>
                  <p>{address.line1 || "Add a default address to speed up checkout."}</p>
                  <p>
                    {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
                  </p>
                  <p>{address.country}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
