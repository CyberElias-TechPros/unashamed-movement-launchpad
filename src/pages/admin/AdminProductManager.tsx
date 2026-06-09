import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Search,
  Filter,
  Grid3x3,
  X,
  Upload,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { productsApi, Product } from "@/api/products";
import MediaPicker from "@/components/MediaPicker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { Pagination, PaginationInfo, PageSizeSelector } from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ProductCategory = "merch" | "digital" | "book" | "apparel" | "accessories";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  tag: string;
  images: string[];
}

const emptyProduct: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "merch",
  tag: "",
  images: [],
};

const AdminProductManager = () => {
  const [editing, setEditing] = useState<ProductFormData | null>(null);
  const [open, setOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Use paginated query for products
  const {
    data: products,
    pagination,
    isLoading,
    page,
    limit,
    setPage,
    setLimit,
    goToNextPage,
    goToPrevPage,
    refresh,
  } = usePaginatedQuery<Product>({
    endpoint: "/products/admin/all",
    queryKey: ["products", "admin"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Product, "id">) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refresh();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refresh();
      setDeleteTarget(null);
    },
  });

  // Client-side filtering for search (will be moved to server-side in future)
  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditing({ ...emptyProduct, images: [] });
    setOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditing({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      stock: product.stock ?? 0,
      category: (product.category as ProductCategory) || "merch",
      tag: product.tag || "",
      images: product.images || [],
    });
    setOpen(true);
  };

  const handleSave = useCallback(async () => {
    if (!editing?.name) return;
    const productData: Partial<Product> & { images?: string[] } = {
      name: editing.name,
      description: editing.description,
      price: editing.price,
      stock: editing.stock,
      category: editing.category,
      tag: editing.tag,
      images: editing.images,
    };

    if (editing._id || editing._id) {
      await updateMutation.mutateAsync({ id: editing._id || editing._id!, data: productData });
    } else {
      await createMutation.mutateAsync(productData as Omit<Product, "id">);
    }
    setOpen(false);
    setEditing(null);
  }, [editing, createMutation, updateMutation]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeleteTarget(id);
    },
    [],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget);
  }, [deleteTarget, deleteMutation]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your shop catalog.</p>
        </div>
        <Button onClick={openAddModal} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v: ProductCategory | "all") => setCategoryFilter(v)}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="merch">Merch</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="book">Book</SelectItem>
            <SelectItem value="apparel">Apparel</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <PaginationInfo
          page={pagination.page}
          limit={pagination.limit}
          totalCount={pagination.totalCount}
        />
        <PageSizeSelector
          value={limit}
          onChange={setLimit}
          options={[10, 25, 50, 100]}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No products found.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {products.length === 0 ? "Add your first product to get started." : "Try adjusting your search or filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Card key={p._id || p.id} className="transition-all hover:shadow-md group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{p.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{p.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">${p.price?.toFixed(2)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {p.images?.[0] && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{p.category}</Badge>
                    {p.tag && <Badge variant="secondary">{p.tag}</Badge>}
                    <span className="text-xs text-muted-foreground ml-auto">Stock: {p.stock ?? 0}</span>
                  </div>
                  <div className="flex justify-end gap-1 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(p)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p._id || p.id || "")} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center pt-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wider">{editing?._id || editing?._id ? "Edit" : "New"} Product</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g., Unashamed T-Shirt"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the product..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v: ProductCategory) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merch">Merch</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="apparel">Apparel</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Input
                    value={editing.tag}
                    onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                    placeholder="e.g., new, sale"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Images</Label>
                {editing.images && editing.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editing.images.map((img, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border group/img">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                          onClick={() => setEditing({
                            ...editing,
                            images: editing.images?.filter((_, i) => i !== idx),
                          })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={editing.images?.[0] || ""}
                    onChange={(e) => setEditing({
                      ...editing,
                      images: e.target.value ? [e.target.value] : [],
                    })}
                    placeholder="Image URL or select from library"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={() => setMediaPickerOpen(true)}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Use the Media Library to browse and select images.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => {
          setEditing((prev) => {
            const currentImages = prev?.images || [];
            if (currentImages.includes(url)) return prev;
            return { ...prev!, images: [...currentImages, url] };
          });
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the product from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProductManager;
