import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CartContext } from "./cart-context.js";

const CART_KEY = "zivora_cart";

const createLineId = (product, selections) =>
  [product._id, selections.size || "default", selections.color || "default"].join(":");

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1, selections = {}) => {
    const lineId = createLineId(product, selections);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.lineId === lineId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.lineId === lineId
            ? { ...item, qty: Math.min(item.qty + quantity, product.stock || 99) }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          lineId,
          _id: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
          image: product.images?.[0]?.url,
          qty: quantity,
          selections,
        },
      ];
    });

    toast.success(`${product.name} added to cart.`);
  };

  const removeItem = (lineId) => {
    setItems((currentItems) => currentItems.filter((item) => item.lineId !== lineId));
    toast.success("Item removed from cart.");
  };

  const updateItemQty = (lineId, qty) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.lineId === lineId
          ? {
              ...item,
              qty: Math.max(1, Math.min(qty, item.stock || 99)),
            }
          : item,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.discountPrice ?? item.price) * item.qty,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQty,
        clearCart,
        totalPrice,
        itemCount: items.reduce((sum, item) => sum + item.qty, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
