
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Download, Edit, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Asset, BrandscriptAnswers, BusinessInfoAnswers } from "@/types/assets";
import { BrandscriptDisplay } from "@/components/assets/BrandscriptDisplay";
import { BusinessInfoDisplay } from "@/components/assets/BusinessInfoDisplay";
import { CustomerPersonasDisplay } from "@/components/assets/CustomerPersonasDisplay";
import { ProblemStatementsDisplay } from "@/components/assets/ProblemStatementsDisplay";
import { AssetForm } from "@/components/assets/AssetForm";
import { AssetTypeSelector } from "@/components/assets/AssetTypeSelector";

export const Assets = () => {
  const { businessId } = useParams();
  const [open, setOpen] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [assetType, setAssetType] = useState<'brandscript' | 'business_info' | 'customer_personas' | 'problem_statements'>('brandscript');
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
        } else if (assetType === 'problem_statements') {
          const selectedAssetsData = assets?.assets.filter(a => selectedAssets.includes(a.id)) || [];
          const brandscript = selectedAssetsData.find(a => a.type === 'brandscript')?.content.brandscript || '';
          const personas = selectedAssetsData.find(a => a.type === 'customer_personas')?.content.personas || '';

          if (!brandscript) {
            throw new Error('A brandscript is required to generate problem statements');
          }

          const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-problem-statements', {
            body: { 
              brandscript,
              personas
            }
          });

          if (functionError) throw new Error(functionError.message);
          
          const { problem_statements, error } = functionData;
          if (error) throw new Error(error);

          // Parse the problem statements if they're a string
          const parsedProblemStatements = typeof problem_statements === 'string' 
            ? JSON.parse(problem_statements) 
            : problem_statements;

          const { error: insertError } = await supabase
            .from('assets')
            .insert([{
              business_id: businessId,
              type: 'problem_statements',
              status: 'complete',
              content: {
                problem_statements: parsedProblemStatements,
                referenced_assets: selectedAssets
              },
              referenced_assets: selectedAssets
            }]);

          if (insertError) throw insertError;
          toast.success('Problem Statements created successfully');
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