import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { ordersApi, Order } from "@/api/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusOptions = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string>("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await ordersApi.getAll();
        setOrders(data);
      } catch (err: any) {
        setError(err?.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const updated = await ordersApi.updateStatus(orderId, status);
      setOrders((prev) => prev.map((order) => (order.id === updated._id || order._id === updated._id ? { ...order, status } : order)));
    } catch (err: any) {
      setError(err?.message || "Unable to update status.");
    } finally {
      setUpdating("");
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh]">
        <div className="container-custom">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl">Manage Orders</h1>
              <p className="text-muted-foreground">Review and update order fulfillment status.</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh orders
            </Button>
          </div>

          {loading && <p>Loading orders...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && orders.length === 0 && <p>No orders found.</p>}

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id || order._id} className="bg-card">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">Order {order.id || order._id}</CardTitle>
                      <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="rounded-full border border-border px-3 py-1 text-sm">{order.status}</span>
                      <span className="text-sm text-muted-foreground">${order.total?.toFixed(2) ?? order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p>{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment</p>
                      <p>{order.paymentMethod || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Shipping</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Items</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {order.items?.map((item: any, index: number) => (
                        <div key={`${item.productId || item.name}-${index}`} className="rounded-lg bg-muted p-3">
                          <p className="font-medium">{item.name || item.product?.name}</p>
                          <p className="text-sm">Qty: {item.quantity}</p>
                          <p className="text-sm">${item.price?.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      Update status:
                      <select
                        className="rounded-lg border p-2"
                        value={order.status}
                        onChange={(event) => handleStatusChange(order.id || order._id, event.target.value)}
                        disabled={updating === (order.id || order._id)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                    <Button disabled={updating === (order.id || order._id)}>
                      {updating === (order.id || order._id) ? 'Updating...' : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminOrders;
