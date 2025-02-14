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
import { Copy, Download, Edit, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

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

type BusinessInfoAnswers = {
  services: string;
  excludedServices: string;
  locations: string;
  excludedLocations: string;
  priorityService: string;
  phoneNumber: string;
  address: string;
};

type CustomerPersonasContent = {
  personas: string;
  referenced_assets: string[];
};

type AssetContent = {
  answers: BrandscriptAnswers | BusinessInfoAnswers;
  brandscript?: string;
  personas?: string;
  referenced_assets?: string[];
};

type Asset = {
  id: string;
  business_id: string;
  type: 'brandscript' | 'business_info' | 'customer_personas';
  status: 'draft' | 'complete';
  content: AssetContent;
  created_at: string;
  referenced_assets?: string[];
};

export const Assets = () => {
  const { businessId } = useParams();
  const [open, setOpen] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [assetType, setAssetType] = useState<'brandscript' | 'business_info' | 'customer_personas'>('brandscript');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
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

  const [businessInfoAnswers, setBusinessInfoAnswers] = useState<BusinessInfoAnswers>({
    services: "",
    excludedServices: "",
    locations: "",
    excludedLocations: "",
    priorityService: "",
    phoneNumber: "",
    address: "",
  });

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', businessId],
    queryFn: async () => {
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', businessId)
        .single();

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        assets: (data || []).map(item => ({
          ...item,
          content: item.content as AssetContent
        })) as Asset[],
        businessName: business?.name
      };
    }
  });

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetType(asset.type);
    if (asset.type === 'brandscript') {
      setAnswers(asset.content.answers as BrandscriptAnswers);
    } else {
      setBusinessInfoAnswers(asset.content.answers as BusinessInfoAnswers);
    }
    setOpen(true);
    setShowAssetForm(true);
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = (asset: Asset) => {
    const element = document.createElement('a');
    let content = '';
    let filename = '';

    if (asset.type === 'brandscript') {
      content = asset.content.brandscript!;
      filename = `${(asset.content.answers as BrandscriptAnswers).companyName}-brandscript.txt`;
    } else {
      // Format business info in a readable way
      const answers = asset.content.answers as BusinessInfoAnswers;
      content = Object.entries(answers)
        .map(([key, value]) => {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          return `${formattedKey}:\n${value}\n`;
        })
        .join('\n');
      filename = `business-information.txt`;
    }

    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', asset.id);

      if (error) throw error;

      toast.success('Asset deleted successfully');
      setViewingAsset(null);
      queryClient.invalidateQueries({ queryKey: ['assets', businessId] });
    } catch (error: any) {
      toast.error('Failed to delete asset');
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAsset) {
        if (editingAsset.type === 'brandscript') {
          // Re-run OpenAI for edited brandscripts
          const { data, error: functionError } = await supabase.functions.invoke('generate-brandscript', {
            body: { answers }
          });

          if (functionError) throw new Error(functionError.message);
          
          const { brandscript, error } = data;
          if (error) throw new Error(error);

          const { error: updateError } = await supabase
            .from('assets')
            .update({
              content: {
                answers,
                brandscript,
              }
            })
            .eq('id', editingAsset.id);

          if (updateError) throw updateError;
        } else {
          const { error: updateError } = await supabase
            .from('assets')
            .update({
              content: {
                answers: businessInfoAnswers
              }
            })
            .eq('id', editingAsset.id);

          if (updateError) throw updateError;
        }
        toast.success(`${editingAsset.type === 'business_info' ? 'Business Information' : 'Brandscript'} updated successfully`);
      } else {
        if (assetType === 'brandscript') {
          const { data, error: functionError } = await supabase.functions.invoke('generate-brandscript', {
            body: { answers }
          });

          if (functionError) throw new Error(functionError.message);
          
          const { brandscript, error } = data;
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
        } else if (assetType === 'business_info') {
          const { error: insertError } = await supabase
            .from('assets')
            .insert([{
              business_id: businessId,
              type: 'business_info',
              status: 'complete',
              content: {
                answers: businessInfoAnswers
              },
            }]);

          if (insertError) throw insertError;
          toast.success('Business Information saved successfully');
        } else if (assetType === 'customer_personas') {
          const selectedAssetsData = assets?.assets.filter(a => selectedAssets.includes(a.id)) || [];
          const brandscript = selectedAssetsData.find(a => a.type === 'brandscript')?.content.brandscript || '';
          const businessInfo = selectedAssetsData.find(a => a.type === 'business_info')?.content.answers || {};

          const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-personas', {
            body: { 
              brandscript,
              businessInfo
            }
          });

          if (functionError) throw new Error(functionError.message);
          
          const { personas, error } = functionData;
          if (error) throw new Error(error);

          const { error: insertError } = await supabase
            .from('assets')
            .insert([{
              business_id: businessId,
              type: 'customer_personas',
              status: 'complete',
              content: {
                personas,
                referenced_assets: selectedAssets
              },
              referenced_assets: selectedAssets
            }]);

          if (insertError) throw insertError;
          toast.success('Customer Personas created successfully');
        }
      }

      setOpen(false);
      setShowAssetForm(false);
      setEditingAsset(null);
      setSelectedAssets([]);
      setAnswers({
        companyName: "",
        productsServices: "",
        targetAudience: "",
        mainProblem: "",
        solution: "",
        differentiation: "",
        authority: "",
        steps: "",
      });
      setBusinessInfoAnswers({
        services: "",
        excludedServices: "",
        locations: "",
        excludedLocations: "",
        priorityService: "",
        phoneNumber: "",
        address: "",
      });
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-header">{assets?.businessName} - Assets</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setEditingAsset(null);
            setAssetType('brandscript');
            setShowAssetForm(false);
            setAnswers({
              companyName: "",
              productsServices: "",
              targetAudience: "",
              mainProblem: "",
              solution: "",
              differentiation: "",
              authority: "",
              steps: "",
            });
            setBusinessInfoAnswers({
              services: "",
              excludedServices: "",
              locations: "",
              excludedLocations: "",
              priorityService: "",
              phoneNumber: "",
              address: "",
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="slide-in">
              <Plus className="h-4 w-4 mr-2" />
              Create Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {showAssetForm ? `Create New ${assetType === 'brandscript' ? 'Brandscript' : assetType === 'business_info' ? 'Business Information' : 'Customer Personas'}` : 'Create New Asset'}
              </DialogTitle>
              <DialogDescription>
                {showAssetForm ? 'Fill in the required information' : 'Select an asset type to create'}
              </DialogDescription>
            </DialogHeader>
            {!showAssetForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => {
                    setAssetType('brandscript');
                    setShowAssetForm(true);
                  }}
                >
                  <CardHeader className="text-center">
                    <CardTitle>Brandscript</CardTitle>
                    <CardDescription className="line-clamp-2">
                      Create a brandscript for your business
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => {
                    setAssetType('business_info');
                    setShowAssetForm(true);
                  }}
                >
                  <CardHeader className="text-center">
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription className="line-clamp-2">
                      Add your business details
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => {
                    setAssetType('customer_personas');
                    setShowAssetForm(true);
                  }}
                >
                  <CardHeader className="text-center">
                    <CardTitle>Customer Personas</CardTitle>
                    <CardDescription className="line-clamp-2">
                      Generate detailed customer personas
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ) : (
              <form onSubmit={handleCreateAsset} className="space-y-4 pr-2">
                {assetType === 'customer_personas' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Brandscript and Business Information</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assets?.assets
                          .filter(a => ['brandscript', 'business_info'].includes(a.type))
                          .map((asset) => (
                            <div
                              key={asset.id}
                              className="flex items-start space-x-2 p-4 rounded-lg border bg-card"
                            >
                              <Checkbox
                                id={asset.id}
                                checked={selectedAssets.includes(asset.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedAssets(prev => [...prev, asset.id]);
                                  } else {
                                    setSelectedAssets(prev => prev.filter(id => id !== asset.id));
                                  }
                                }}
                                className="mt-1"
                              />
                              <Label htmlFor={asset.id} className="text-sm space-y-1">
                                <span className="font-medium block">
                                  {asset.type === 'brandscript' 
                                    ? `Brandscript - ${(asset.content.answers as BrandscriptAnswers).companyName}`
                                    : 'Business Information'}
                                </span>
                                <span className="text-xs text-muted-foreground block">
                                  Created: {formatDate(asset.created_at)}
                                </span>
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : assetType === 'business_info' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="services">What are your services?</Label>
                      <Textarea
                        id="services"
                        value={businessInfoAnswers.services}
                        onChange={(e) => setBusinessInfoAnswers(prev => ({ ...prev, services: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="excludedServices">Are there any services in your industry you DO NOT offer?</Label>
                      <Textarea
                        id="excludedServices"
                        value={businessInfoAnswers.excludedServices}
                        onChange={(e) => setBusinessInfoAnswers(prev => ({ ...prev, excludedServices: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locations">What locations do you serve?</Label>
                      <Textarea
                        id="locations"
                        value={businessInfoAnswers.locations}
                        onChange={(e) => setBusinessInfoAnswers(prev => ({ ...prev, locations: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="excludedLocations">Are there any locations in your area you DO NOT serve?</Label>
                      <Textarea
                        id="excludedLocations"
                        value={businessInfoAnswers.excludedLocations}
                        onChange={(e) => setBusinessInfoAnswers(prev => ({ ...prev, excludedLocations: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priorityService">What service do you want to sell the most?</Label>
                      <Textarea
                        id="priorityService"
                        value={businessInfoAnswers.priorityService}
                        onChange={(e) => setBusinessInfoAnswers(prev => ({ ...prev, priorityService: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">What is your business phone number?</Label>
                      <Input
                        id="phoneNumber"
                        value={businessInfoAnswers.phoneNumber}
                        onChange={(e) => setBusinessInfoAnswers(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">What is your business address?</Label>
                      <Textarea
                        id="address"
                        value={businessInfoAnswers.address}
                        onChange={(e) => setBusinessInfoAnswers(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">What is your company name?</Label>
                      <Input
                        id="companyName"
                        value={(answers as BrandscriptAnswers).companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productsServices">What products or services do you offer?</Label>
                      <Textarea
                        id="productsServices"
                        value={(answers as BrandscriptAnswers).productsServices}
                        onChange={(e) => handleInputChange('productsServices', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Who is your target audience?</Label>
                      <Textarea
                        id="targetAudience"
                        value={(answers as BrandscriptAnswers).targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mainProblem">What is the main problem your customers deal with?</Label>
                      <Textarea
                        id="mainProblem"
                        value={(answers as BrandscriptAnswers).mainProblem}
                        onChange={(e) => handleInputChange('mainProblem', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="solution">What is your solution?</Label>
                      <Textarea
                        id="solution"
                        value={(answers as BrandscriptAnswers).solution}
                        onChange={(e) => handleInputChange('solution', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="differentiation">What differentiates your brand from competitors?</Label>
                      <Textarea
                        id="differentiation"
                        value={(answers as BrandscriptAnswers).differentiation}
                        onChange={(e) => handleInputChange('differentiation', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authority">What awards, accolades, or success metrics give you authority?</Label>
                      <Textarea
                        id="authority"
                        value={(answers as BrandscriptAnswers).authority}
                        onChange={(e) => handleInputChange('authority', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="steps">What steps does a customer need to take to buy/use your product?</Label>
                      <Textarea
                        id="steps"
                        value={(answers as BrandscriptAnswers).steps}
                        onChange={(e) => handleInputChange('steps', e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAssetForm(false)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={loading || (assetType === 'customer_personas' && selectedAssets.length === 0)}
                  >
                    {loading ? 'Saving...' : 'Save Asset'}
                  </Button>
                </div>
              </form>
            )}
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
        ) : assets?.assets.length === 0 ? (
          <Card className="glass-card col-span-full p-6">
            <p className="text-center text-muted-foreground">
              No assets found. Click the "Create Asset" button to create one.
            </p>
          </Card>
        ) : (
          assets?.assets.map((asset) => (
            <div key={asset.id}>
              <Card 
                className="glass-card cursor-pointer transition-all hover:shadow-md"
                onClick={() => setViewingAsset(asset)}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardDescription className="text-sm font-medium text-primary mb-1">
                      {asset.type === 'brandscript' ? 'Brandscript' : asset.type === 'business_info' ? 'Business Information' : 'Customer Personas'}
                    </CardDescription>
                    <CardDescription>
                      Created: {formatDate(asset.created_at)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAsset(asset);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>

              <Dialog open={viewingAsset?.id === asset.id} onOpenChange={(isOpen) => !isOpen && setViewingAsset(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {viewingAsset?.type === 'brandscript' ? 'Brandscript' : viewingAsset?.type === 'business_info' ? 'Business Information' : 'Customer Personas'}
                    </DialogTitle>
                    <DialogDescription>
                      Created: {formatDate(viewingAsset?.created_at)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {asset.type === 'brandscript' ? (
                      <Card className="bg-muted/50">
                        <CardContent className="p-6">
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {asset.content.brandscript}
                          </pre>
                        </CardContent>
                      </Card>
                    ) : asset.type === 'business_info' ? (
                      <div className="grid gap-4">
                        {Object.entries(asset.content.answers as BusinessInfoAnswers).map(([key, value]) => (
                          <Card key={key} className="bg-muted/50">
                            <CardHeader>
                              <CardTitle className="text-sm">
                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                              </CardTitle>
                              <CardDescription>
                                {value}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {asset.content.personas?.split('### Persona').filter(Boolean).map((persona, index) => {
                          const sections = persona.match(/\*\*(.*?)\*\*\s*([^*]+)/g) || [];
                          return (
                            <Card key={index} className="bg-muted/50">
                              <CardHeader>
                                <CardTitle>Persona {index + 1}</CardTitle>
                              </CardHeader>
                              <CardContent className="grid gap-4">
                                {sections.map((section, sectionIndex) => {
                                  const [title, ...content] = section.replace(/\*\*/g, '').split(':');
                                  if (content.length > 0) {
                                    return (
                                      <div key={sectionIndex} className="space-y-2">
                                        <h3 className="text-sm font-medium">{title.trim()}</h3>
                                        <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                                          {content.join(':')
                                            .split('-')
                                            .filter(Boolean)
                                            .map((point, pointIndex) => (
                                              <p key={pointIndex} className="text-sm text-muted-foreground">
                                                {point.trim()}
                                              </p>
                                            ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteAsset(asset)}
                    >
                      Delete Asset
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          let content = '';
                          if (asset.type === 'brandscript') {
                            content = asset.content.brandscript!;
                          } else if (asset.type === 'business_info') {
                            content = Object.entries(asset.content.answers as BusinessInfoAnswers)
                              .map(([key, value]) => {
                                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                                return `${formattedKey}:\n${value}`;
                              })
                              .join('\n\n');
                          } else {
                            content = asset.content.personas!;
                          }
                          handleCopyToClipboard(content);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDownload(asset)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
