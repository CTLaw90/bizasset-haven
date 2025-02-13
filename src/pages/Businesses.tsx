
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Businesses</h1>
        <Button className="slide-in">
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Button>
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
