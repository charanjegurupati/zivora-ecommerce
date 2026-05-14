import { startTransition, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { mockOrders } from "../data/mockData.js";

export const useOrders = ({ page = 1, limit = 10, isAdmin = false } = {}) => {
  const [state, setState] = useState({
    orders: [],
    pagination: { page, limit, total: 0, pages: 0 },
    loading: true,
    error: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setState((current) => ({ ...current, loading: true, error: "" }));

      try {
        const endpoint = isAdmin ? "/orders" : "/orders/my";
        const response = await api.get(endpoint, { params: { page, limit } });

        if (!mounted) {
          return;
        }

        startTransition(() => {
          setState({
            orders: response.data?.data?.orders || [],
            pagination: response.data?.data?.pagination || {
              page,
              limit,
              total: 0,
              pages: 0,
            },
            loading: false,
            error: "",
          });
        });
      } catch {
        if (!mounted) {
          return;
        }

        startTransition(() => {
          setState({
            orders: mockOrders,
            pagination: {
              page: 1,
              limit: mockOrders.length,
              total: mockOrders.length,
              pages: 1,
            },
            loading: false,
            error: "Live order feed unavailable, showing preview data.",
          });
        });
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [isAdmin, limit, page]);

  return state;
};
