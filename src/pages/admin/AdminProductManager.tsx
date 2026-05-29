import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productsApi, Product } from "@/api/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyProduct: Partial<Product> = {
  name: "",
  description: "",
  price: 0,
  category: "merch",
  stock: 0,
  tag: "",
};

const AdminProductManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const data = await productsApi.getAll();
    setProducts(data);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const save = async () => {
    if (!editing?.name) return;
    if (editing._id || editing.id) {
      await productsApi.update(editing._id || editing.id!, editing);
    } else {
      await productsApi.create(editing as Omit<Product, "id">);
    }
    setOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await productsApi.delete(id);
    load();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl tracking-wider">Products</h1>
          <p className="text-muted-foreground">Manage shop catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>Back</Button>
          <Button onClick={() => { setEditing({ ...emptyProduct }); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {products.map((p) => (
          <Card key={p._id || p.id}>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">{p.name} — ${p.price}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(p._id || p.id || "")}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              <p className="text-xs mt-2">Stock: {p.stock ?? 0} · {p.category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?._id || editing?.id ? "Edit" : "New"} Product</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={editing.category} onValueChange={(v: "merch" | "digital") => setEditing({ ...editing, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merch">Merch</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={save}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductManager;
