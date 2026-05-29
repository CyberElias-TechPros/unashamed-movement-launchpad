import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/api/products";

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('ttin_wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage:', error);
        localStorage.removeItem('ttin_wishlist');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ttin_wishlist', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems(prevItems => {
      const pid = product._id || product.id;
      if (prevItems.some((item) => (item._id || item.id) === pid)) {
        return prevItems;
      }
      return [...prevItems, product];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => (item._id || item.id) === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value: WishlistContextType = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};