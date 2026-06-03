import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { reviewsApi } from '@/api/reviews';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin:reviews'],
    queryFn: () => reviewsApi.getAll(),
  });

  const approve = useMutation({
    mutationFn: (id: string) => reviewsApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin:reviews'] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin:reviews'] }),
  });

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <section className="section-padding">
          <div className="container-custom">
            <h1 className="font-heading text-2xl mb-4">Product Reviews</h1>
            {isLoading && <p>Loading...</p>}
            {!isLoading && reviews && reviews.length === 0 && <p>No reviews yet.</p>}
            <div className="space-y-3">
              {reviews?.map((r: any) => (
                <div key={r._id} className="border border-border rounded p-3 flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{r.name || 'Anonymous'} <span className="text-sm text-muted-foreground">· {r.rating}/5</span></div>
                    <div className="text-sm">{r.title}</div>
                    <div className="text-sm text-muted-foreground">{r.body}</div>
                    <div className="text-xs text-muted-foreground mt-2">Product: {r.product}</div>
                  </div>
                  <div className="flex gap-2">
                    {!r.approved && <Button onClick={() => approve.mutate(r._id)}>Approve</Button>}
                    <Button variant="destructive" onClick={() => remove.mutate(r._id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminReviews;
