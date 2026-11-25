import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wishlist";
const CHANGE_EVENT = "wishlist:changed";

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full or blocked – ignore */
  }
  // Tell every component using this hook (same tab) to refresh
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

/**
 * Guest-friendly wishlist stored in localStorage.
 * Stores a small snapshot of each product so a wishlist page / drawer
 * can render without calling the API.
 */
export default function useWishlist() {
  const [items, setItems] = useState(read);

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(CHANGE_EVENT, sync); // same tab
    window.addEventListener("storage", sync); // other tabs
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isWishlisted = useCallback(
    (id) => items.some((i) => String(i.id) === String(id)),
    [items]
  );

  // returns true if added, false if removed
  const toggle = useCallback((product) => {
    const current = read();
    const exists = current.some((i) => String(i.id) === String(product.id));
    if (exists) {
      write(current.filter((i) => String(i.id) !== String(product.id)));
      return false;
    }
    write([
      {
        id: product.id,
        product_name: product.product_name,
        product_brand_name: product.product_brand_name || "",
        price: Number(product.price) || 0,
        stock: product.stock,
        image:
          product.product_images?.find((img) => img.is_primary)?.image ||
          product.product_images?.[0]?.image ||
          "",
        added_at: Date.now(),
      },
      ...current,
    ]);
    return true;
  }, []);

  const remove = useCallback((id) => {
    write(read().filter((i) => String(i.id) !== String(id)));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items, count: items.length, isWishlisted, toggle, remove, clear };
}
