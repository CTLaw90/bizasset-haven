
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

// Temporary type until Supabase generates the proper one
type Business = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  additional_info: any;
}

export const Businesses = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Business[];
    }
  });

  const handleCreateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      const { error } = await supabase
        .from('businesses')
        .insert([{ name, description }]);

      if (error) throw error;

      toast.success('Business created successfully');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    } catch (error) {
      console.error('Error creating business:', error);
      toast.error('Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Businesses</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="slide-in">
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Business</DialogTitle>
              <DialogDescription>
                Add a new business to your portfolio.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter business name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter business description"
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Business'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          className="pl-9 max-w-md"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))
        ) : businesses?.length === 0 ? (
          <Card className="glass-card col-span-full p-6">
            <p className="text-center text-muted-foreground">
              No businesses found. Click the "Add Business" button to create one.
            </p>
          </Card>
        ) : (
          businesses?.map((business) => (
            <Card key={business.id} className="glass-card hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{business.name}</CardTitle>
                <CardDescription>
                  Created {format(new Date(business.created_at), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {business.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
