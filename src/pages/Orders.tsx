import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { ordersApi, Order } from "@/api/orders";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  product?: { _id?: string; name?: string };
  name?: string;
  quantity: number;
  price: number;
}

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const response = await ordersApi.getUserOrders();
        setOrders(response);
      } catch (err) {
        setError((err as Error)?.message || "Unable to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [isAuthenticated]);

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh]">
        <div className="container-custom">
          <h1 className="font-heading text-3xl mb-6">Order History</h1>
          {!isAuthenticated && <p>Please log in to view your order history.</p>}
          {loading && <p>Loading orders...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && isAuthenticated && orders.length === 0 && (
            <p>You have no past orders yet.</p>
          )}
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id || order.id} className="rounded-xl border border-border p-5 bg-card">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-semibold">{order._id || order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold">${order.totalAmount?.toFixed(2) ?? '0.00'}</p>
                  </div>
                </div>
<div className="grid gap-2 sm:grid-cols-2">
                    {order.items?.map((item: OrderItem, idx: number) => (
                      <div key={item.product?._id || item.name || idx} className="rounded-lg bg-muted p-3">
                        <p className="font-medium">{item.name || item.product?.name || "Unknown item"}</p>
                        <p className="text-sm">Qty: {item.quantity}</p>
                        <p className="text-sm">${item.price?.toFixed(2) ?? "0.00"}</p>
                      </div>
                    ))}
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Orders;
