
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
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type BrandscriptAnswers = {
  companyName: string;
  productsServices: string;
  targetAudience: string;
  mainProblem: string;
  solution: string;
  differentiation: string;
  authority: string;
  steps: string;
};

type AssetContent = {
  answers: BrandscriptAnswers;
  brandscript: string;
};

type Asset = {
  id: string;
  business_id: string;
  type: 'brandscript' | 'content' | 'profile';
  status: 'draft' | 'complete';
  content: AssetContent;
  created_at: string;
};

export const Assets = () => {
  const { businessId } = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<BrandscriptAnswers>({
    companyName: "",
    productsServices: "",
    targetAudience: "",
    mainProblem: "",
    solution: "",
    differentiation: "",
    authority: "",
    steps: "",
  });

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        content: item.content as AssetContent
      })) as Asset[];
    }
  });

  const handleCreateBrandscript = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brandscript`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const { brandscript, error } = await response.json();
      if (error) throw new Error(error);

      const { error: insertError } = await supabase
        .from('assets')
        .insert([{
          business_id: businessId,
          type: 'brandscript',
          status: 'complete',
          content: {
            answers,
            brandscript,
          },
        }]);

      if (insertError) throw insertError;

      toast.success('Brandscript created successfully');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['assets', businessId] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BrandscriptAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Assets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="slide-in">
              <Plus className="h-4 w-4 mr-2" />
              Create Brandscript
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Brandscript</DialogTitle>
              <DialogDescription>
                Answer these questions to generate your brandscript.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBrandscript} className="space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">What is your company name?</Label>
                <Input
                  id="companyName"
                  value={answers.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productsServices">What products or services do you offer?</Label>
                <Textarea
                  id="productsServices"
                  value={answers.productsServices}
                  onChange={(e) => handleInputChange('productsServices', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Who is your target audience?</Label>
                <Textarea
                  id="targetAudience"
                  value={answers.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mainProblem">What is the main problem your customers deal with?</Label>
                <Textarea
                  id="mainProblem"
                  value={answers.mainProblem}
                  onChange={(e) => handleInputChange('mainProblem', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solution">What is your solution?</Label>
                <Textarea
                  id="solution"
                  value={answers.solution}
                  onChange={(e) => handleInputChange('solution', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="differentiation">What differentiates your brand from competitors?</Label>
                <Textarea
                  id="differentiation"
                  value={answers.differentiation}
                  onChange={(e) => handleInputChange('differentiation', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authority">What awards, accolades, or success metrics give you authority?</Label>
                <Textarea
                  id="authority"
                  value={answers.authority}
                  onChange={(e) => handleInputChange('authority', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="steps">What steps does a customer need to take to buy/use your product?</Label>
                <Textarea
                  id="steps"
                  value={answers.steps}
                  onChange={(e) => handleInputChange('steps', e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mb-4" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Brandscript'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assetsLoading ? (
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
        ) : assets?.length === 0 ? (
          <Card className="glass-card col-span-full p-6">
            <p className="text-center text-muted-foreground">
              No assets found. Click the "Create Brandscript" button to create one.
            </p>
          </Card>
        ) : (
          assets?.map((asset) => (
            <Card key={asset.id} className="glass-card">
              <CardHeader>
                <CardTitle>{asset.type}</CardTitle>
                <CardDescription>Status: {asset.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm">
                  <pre className="whitespace-pre-wrap">
                    {asset.content.brandscript}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
