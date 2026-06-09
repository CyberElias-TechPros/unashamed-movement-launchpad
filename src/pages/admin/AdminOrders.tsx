import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, Order, OrderItem } from "@/api/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Search } from "lucide-react";

const statusOptions = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["orders", "admin"],
    queryFn: () => ordersApi.getAll(),
  });

  const filteredOrders = orders.filter((o: Order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.customerEmail || "").toLowerCase().includes(q) ||
      (o.id || o._id || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl tracking-wider text-foreground">Orders</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-red-600">
            Unable to load orders. {(error as Error).message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage orders and update fulfillment status.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filtered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading">{filteredOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading text-amber-600">
              {filteredOrders.filter((o: Order) => o.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading text-blue-600">
              {filteredOrders.filter((o: Order) => o.status === "processing").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading text-green-600">
              {filteredOrders.filter((o: Order) => o.status === "delivered" || o.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                {isLoading ? "Loading orders..." : `All Orders (${filteredOrders.length})`}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none sm:w-56">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading && filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No orders found.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Payment</TableHead>
                      <TableHead className="hidden xl:table-cell">Shipping</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order: Order) => (
                      <OrderRow key={order.id || order._id} order={order} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const OrderRow = ({ order }: { order: Order }) => {
  const queryClient = useQueryClient();
  const orderId = order.id || order._id;

  const updateMutation = useMutation({
    mutationFn: (status: string) => ordersApi.updateStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", "admin"] }),
  });

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">
        {orderId?.slice(0, 8).toUpperCase()}
      </TableCell>
      <TableCell className="font-medium">{order.customerName}</TableCell>
      <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[180px] truncate">
        {order.customerEmail}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-sm">
        {order.paymentMethod || "—"}
      </TableCell>
      <TableCell className="hidden xl:table-cell text-sm">
        {order.shippingAddress?.city || "—"}
        {order.shippingAddress?.country ? `, ${order.shippingAddress.country}` : ""}
      </TableCell>
      <TableCell className="font-medium">
        ${order.total?.toFixed(2) ?? order.totalAmount?.toFixed(2)}
      </TableCell>
      <TableCell>
        <Select
          value={order.status}
          onValueChange={(v) => updateMutation.mutate(v)}
          disabled={updateMutation.isPending}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.filter(s => s !== "all").map((s) => (
              <SelectItem key={s} value={s}>
                <span className="text-xs">{s}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {order.items && order.items.length > 0 && (
            <OrderItemsDialog order={order} />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const OrderItemsDialog = ({ order }: { order: Order }) => {
  const orderId = order.id || order._id;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs">
          {order.items?.length ?? 0} item(s)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Order Items</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Order #{orderId?.slice(0, 8).toUpperCase()}
          </p>
        </DialogHeader>
<div className="space-y-3 max-h-[50vh] overflow-y-auto">
           {order.items?.map((item: OrderItem, idx: number) => (
             <Card key={`${item.productId || item.name}-${idx}`}>
               <CardContent className="flex items-center justify-between p-4">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                     <Package className="h-5 w-5 text-muted-foreground" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-medium text-sm truncate">
                       {item.name || item.product?.name || "Unknown item"}
                     </p>
                     <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                   </div>
                 </div>
                 <Badge variant="outline" className="shrink-0">
                   ${item.price?.toFixed(2) ?? "0.00"}
                 </Badge>
               </CardContent>
             </Card>
           ))}
         </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOrders;
