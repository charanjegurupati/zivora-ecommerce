import { ArrowRight, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { QuantityStepper } from "../components/common/QuantityStepper.jsx";
import { useCart } from "../hooks/useCart.js";
import { formatCurrency } from "../utils/currency.js";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, totalPrice, updateItemQty } = useCart();
  const discount = totalPrice > 250 ? totalPrice * 0.08 : 0;
  const grandTotal = totalPrice - discount;

  if (!items.length) {
    return (
      <div className="page-section">
        <div className="surface-panel px-8 py-16 text-center">
          <h1 className="display-title text-4xl font-semibold text-ink-950">Your cart is empty</h1>
          <p className="mt-4 text-slate-600">Start with the featured edit and build your bundle.</p>
          <Link to="/products" className="glass-button mt-8">
            Browse catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="page-section">
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel space-y-5 p-6">
          <div>
            <p className="eyebrow mb-3">Cart</p>
            <h1 className="display-title text-4xl font-semibold text-ink-950">Review your picks</h1>
          </div>

          {items.map((item) => (
            <article
              key={item.lineId}
              className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-4 sm:grid-cols-[140px_1fr]"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-36 w-full rounded-[20px] object-cover"
              />
              <div className="flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink-950">{item.name}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {item.selections?.size} / {item.selections?.color}
                    </p>
                    <p className="mt-3 text-base font-semibold text-ink-950">
                      {formatCurrency(item.discountPrice ?? item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-sand-50"
                    onClick={() => removeItem(item.lineId)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <QuantityStepper
                  value={item.qty}
                  max={item.stock || 99}
                  onChange={(qty) => updateItemQty(item.lineId, qty)}
                />
              </div>
            </article>
          ))}
        </div>

        <aside className="surface-panel h-fit space-y-6 p-6">
          <div>
            <p className="eyebrow mb-3">Summary</p>
            <h2 className="display-title text-2xl font-semibold text-ink-950">Checkout snapshot</h2>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Bundle discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-ink-950">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <input
            className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
            placeholder="Coupon code"
          />

          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-4 text-sm font-semibold text-sand-50"
            onClick={() => navigate("/checkout")}
          >
            Continue to checkout
            <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </section>
  );
}
