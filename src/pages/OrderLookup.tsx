import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, PackageSearch, CheckCircle2, Clock, XCircle, RotateCcw } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ordersApi, Order } from "@/api/orders";
import { formatCurrency } from "@/lib/format";
import { SEO } from "@/components/SEO";

const STATUS_STYLES: Record<string, { icon: typeof Clock; classes: string }> = {
  pending: { icon: Clock, classes: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
  processing: { icon: Clock, classes: "text-blue-600 bg-blue-500/10 border-blue-500/30" },
  shipped: { icon: PackageSearch, classes: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30" },
  delivered: { icon: CheckCircle2, classes: "text-green-600 bg-green-500/10 border-green-500/30" },
  completed: { icon: CheckCircle2, classes: "text-green-600 bg-green-500/10 border-green-500/30" },
  cancelled: { icon: XCircle, classes: "text-red-600 bg-red-500/10 border-red-500/30" },
};

const OrderLookup = () => {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<(Order & { currency?: string; refundedAt?: string | null }) | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setSearching(true);
    try {
      const found = await ordersApi.lookup(email.trim().toLowerCase(), orderId.trim());
      setOrder(found);
    } catch (err) {
      setError((err as { message?: string })?.message || "Order not found");
    } finally {
      setSearching(false);
    }
  };

  const status = order?.status || "pending";
  const Style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const StatusIcon = Style.icon;

  return (
    <Layout>
      <SEO title="Track Your Order" description="Look up the status of your TTIN order with your email and order ID — no account needed." />
      <section className="section-padding bg-primary pt-28 pb-16">
        <div className="container-custom max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-2">
              Order Lookup
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl tracking-wider text-primary-foreground mb-3">
              Track Your Order
            </h1>
            <p className="text-primary-foreground/70 font-body">
              Enter the email you used at checkout and your order ID (from your confirmation
              email). No account required.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom max-w-xl">
          <form onSubmit={handleSearch} className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div>
              <label htmlFor="lookup-email" className="font-body text-sm mb-2 block">Email used at checkout</label>
              <Input
                id="lookup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="lookup-order" className="font-body text-sm mb-2 block">Order ID</label>
              <Input
                id="lookup-order"
                placeholder="e.g. 650a1b2c3d4e…"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={searching}>
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" /> Find my order
                </>
              )}
            </Button>
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}
          </form>

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 mt-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order</p>
                  <p className="font-heading text-lg break-all">{order.id || order._id}</p>
                  {order.createdAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Placed {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium capitalize ${Style.classes}`}>
                  <StatusIcon className="w-4 h-4" />
                  {order.refundedAt ? "refunded" : status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-border pb-3">
                    <div>
                      <p className="font-body font-medium">
                        {item.product && typeof item.product === "object" ? item.product.name : item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-body">
                      {formatCurrency((item.price || 0) * (item.quantity || 1), order.currency || "USD")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-heading text-lg">
                <span>Total</span>
                <span className="text-accent">
                  {formatCurrency(order.totalAmount ?? order.total ?? 0, order.currency || "USD")}
                </span>
              </div>

              {order.refundedAt && (
                <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  This order was refunded on {new Date(order.refundedAt).toLocaleDateString()}.
                </p>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default OrderLookup;
