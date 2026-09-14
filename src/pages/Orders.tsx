import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { ordersApi, Order } from "@/api/orders";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, Lock } from "lucide-react";

interface OrderItem {
  product?: { _id?: string; name?: string };
  name?: string;
  quantity: number;
  price: number;
}

const statusStyles: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  shipped: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

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
      <PageHero
        kicker="Your Footprint"
        title="ORDERS"
        italic={isAuthenticated ? "everything you've claimed" : "sign in to see more"}
      />

      <section className="relative overflow-hidden bg-background">
        {orders.length > 0 && <EmberGlow intensity="low" />}
        <div className="section-padding">
          <div className="container-custom max-w-3xl">
            {!isAuthenticated && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card">
                  <Lock size={40} className="text-muted-foreground" />
                </div>
                <h3 className="mb-4 font-heading text-4xl tracking-wider text-foreground">
                  Sign In Required
                </h3>
                <p className="mx-auto max-w-md font-body text-muted-foreground">
                  Order history is tied to your account. Guest orders appear in your email receipt.
                </p>
              </div>
            )}

            {loading && isAuthenticated && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-6">
                    <Skeleton className="mb-3 h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-center font-body text-destructive">{error}</p>
            )}

            {!loading && isAuthenticated && !error && orders.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card">
                  <Package size={40} className="text-muted-foreground" />
                </div>
                <h3 className="mb-4 font-heading text-4xl tracking-wider text-foreground">
                  No Orders Yet
                </h3>
                <p className="mx-auto mb-10 max-w-md font-body text-muted-foreground">
                  Your first order is one bold statement away.
                </p>
                <Link to="/shop">
                  <Button variant="hero" size="lg">
                    Shop Now <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
              </div>
            )}

            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order._id || order.id}
                  className="rounded-2xl border border-border bg-card/60 p-6 transition-colors hover:border-accent/40"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Order</p>
                      <p className="font-body font-medium text-foreground">
                        #{(order._id || order.id || "").toString().slice(-8)}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                      <span
                        className={`mt-1 inline-block rounded-full border px-3 py-0.5 font-body text-xs font-semibold capitalize ${
                          statusStyles[(order.status || "").toLowerCase()] || "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                      <p className="font-heading text-2xl text-gradient-gold">
                        ${order.totalAmount?.toFixed(2) ?? "0.00"}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {order.items?.map((item: OrderItem, idx: number) => (
                      <div key={item.product?._id || item.name || idx} className="rounded-lg bg-background/60 p-3.5">
                        <p className="font-body font-medium text-foreground">
                          {item.name || item.product?.name || "Unknown item"}
                        </p>
                        <p className="font-body text-sm text-muted-foreground">
                          Qty {item.quantity} · ${item.price?.toFixed(2) ?? "0.00"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Orders;
