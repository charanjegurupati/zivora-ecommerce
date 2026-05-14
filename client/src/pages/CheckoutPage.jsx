import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";
import { formatCurrency } from "../utils/currency.js";

const steps = ["address", "payment", "confirm"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart, totalPrice } = useCart();
  const defaultAddress = user?.defaultAddress || user?.address?.[0];
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [form, setForm] = useState(() => ({
    fullName: user?.name || "",
    line1: defaultAddress?.line1 || "",
    line2: defaultAddress?.line2 || "",
    city: defaultAddress?.city || "",
    state: defaultAddress?.state || "",
    postalCode: defaultAddress?.postalCode || "",
    country: defaultAddress?.country || "",
    phone: defaultAddress?.phone || "",
    paymentMethod: "card",
  }));

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          if (!response.ok) throw new Error("Failed to fetch address");
          
          const data = await response.json();
          const address = data.address;
          
          if (address) {
            setForm((current) => ({
              ...current,
              line1: address.road || address.pedestrian || current.line1,
              line2: address.suburb || address.neighbourhood || current.line2,
              city: address.city || address.town || address.village || current.city,
              state: address.state || current.state,
              postalCode: address.postcode || current.postalCode,
              country: address.country || current.country,
            }));
            toast.success("Address auto-filled");
          } else {
             toast.error("Could not determine address");
          }
        } catch (error) {
          toast.error("Could not fetch address from location");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        toast.error("Location access denied or unavailable");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const placeOrder = async () => {
    setSubmitting(true);

    try {
      await api.post("/orders", {
        items: items.map((item) => ({
          product: item._id,
          qty: item.qty,
        })),
        shippingAddress: {
          fullName: form.fullName,
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone,
        },
        paymentMethod: form.paymentMethod,
      });

      clearCart();
      toast.success("Order placed successfully.");
      navigate("/dashboard");
    } catch (error) {
      const apiError = error.response?.data?.details?.[0]?.msg || error.response?.data?.message;
      toast.error(apiError || "Checkout is available once the API server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <section className="page-section">
      <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <div className="surface-panel p-6 sm:p-8">
          <p className="eyebrow mb-3">Checkout</p>
          <h1 className="display-title text-4xl font-semibold text-ink-950">Complete your order</h1>

          <div className="mt-8 flex flex-wrap gap-2">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                  step === index
                    ? "bg-ink-950 text-sand-50"
                    : "border border-slate-200 bg-white text-ink-900"
                }`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          {step === 0 ? (
            <div className="mt-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink-950">Shipping Details</h3>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={loadingLocation}
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-slate-200 disabled:opacity-60"
                >
                  {loadingLocation ? (
                    <span className="animate-pulse">Locating...</span>
                  ) : (
                    <>
                      <span>📍</span> Use current location
                    </>
                  )}
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["fullName", "Full name"],
                  ["line1", "Address line 1"],
                  ["line2", "Address line 2"],
                  ["city", "City"],
                  ["state", "State"],
                  ["postalCode", "Postal code"],
                  ["country", "Country"],
                  ["phone", "Phone"],
                ].map(([key, label]) => (
                  <label key={key} className={key === "line1" || key === "line2" ? "sm:col-span-2" : ""}>
                    <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
                    <input
                      value={form[key]}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none focus:border-ink-950"
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-8 grid gap-3">
              {[
                ["card", "Credit / debit card"],
                ["paypal", "PayPal"],
                ["upi", "UPI"],
                ["cod", "Cash on delivery"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, paymentMethod: value }))}
                  className={`rounded-[24px] border px-5 py-4 text-left text-sm font-semibold ${
                    form.paymentMethod === value
                      ? "border-ink-950 bg-ink-950 text-sand-50"
                      : "border-slate-200 bg-white text-ink-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-sand-50 p-5 text-sm leading-7 text-slate-600">
              <p className="font-semibold text-ink-950">Shipping to</p>
              <p>{form.fullName}</p>
              <p>{form.line1}</p>
              <p>{form.city}, {form.state} {form.postalCode}</p>
              <p>{form.country}</p>
              <p className="mt-4 font-semibold text-ink-950">Payment method</p>
              <p className="capitalize">{form.paymentMethod}</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {step > 0 ? (
              <button
                type="button"
                className="glass-button"
                onClick={() => setStep((current) => current - 1)}
              >
                Back
              </button>
            ) : null}
            {step < steps.length - 1 ? (
              <button
                type="button"
                className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-sand-50"
                onClick={() => setStep((current) => current + 1)}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-sand-50 disabled:opacity-60"
                onClick={placeOrder}
              >
                {submitting ? "Placing order..." : "Confirm purchase"}
              </button>
            )}
          </div>
        </div>

        <aside className="surface-panel h-fit p-6">
          <h2 className="display-title text-2xl font-semibold text-ink-950">Order summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.lineId} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-ink-950">{item.name}</p>
                  <p className="text-sm text-slate-500">Qty {item.qty}</p>
                </div>
                <p className="font-semibold text-ink-950">
                  {formatCurrency((item.discountPrice ?? item.price) * item.qty)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="text-base font-semibold text-ink-950">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
