
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Asset, BrandscriptAnswers, BusinessInfoAnswers } from "@/types/assets";

interface AssetFormProps {
  assetType: 'brandscript' | 'business_info' | 'customer_personas' | 'problem_statements';
  loading: boolean;
  assets?: Asset[];
  selectedAssets: string[];
  setSelectedAssets: (assets: string[]) => void;
  answers: BrandscriptAnswers;
  businessInfoAnswers: BusinessInfoAnswers;
  handleInputChange: (field: keyof BrandscriptAnswers, value: string) => void;
  setBusinessInfoAnswers: (answers: BusinessInfoAnswers) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formatDate: (date: string) => string;
}

export const AssetForm = ({
  assetType,
  loading,
  assets,
  selectedAssets,
  setSelectedAssets,
  answers,
  businessInfoAnswers,
  handleInputChange,
  setBusinessInfoAnswers,
  onBack,
  onSubmit,
  formatDate,
}: AssetFormProps) => {
  if (assetType === 'customer_personas' || assetType === 'problem_statements') {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select {assetType === 'problem_statements' ? 'Brandscript and Optional Customer Personas' : 'Brandscript and Business Information'}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets?.filter(a => assetType === 'problem_statements' 
                ? ['brandscript', 'customer_personas'].includes(a.type)
                : ['brandscript', 'business_info'].includes(a.type))
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
                          setSelectedAssets([...selectedAssets, asset.id]);
                        } else {
                          setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <Label htmlFor={asset.id} className="text-sm space-y-1">
                      <span className="font-medium block">
                        {asset.type === 'brandscript' 
                          ? `Brandscript - ${(asset.content.answers as BrandscriptAnswers).companyName}`
                          : asset.type === 'customer_personas'
                          ? 'Customer Personas'
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
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={loading || selectedAssets.length === 0}
          >
            {loading ? 'Saving...' : 'Save Asset'}
          </Button>
        </div>
      </form>
    );
  }

  if (assetType === 'business_info') {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="services">What are your services?</Label>
          <Textarea
            id="services"
            value={businessInfoAnswers.services}
            onChange={(e) => setBusinessInfoAnswers({ ...businessInfoAnswers, services: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excludedServices">Are there any services in your industry you DO NOT offer?</Label>
          <Textarea
            id="excludedServices"
            value={businessInfoAnswers.excludedServices}
            onChange={(e) => setBusinessInfoAnswers({ ...businessInfoAnswers, excludedServices: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locations">What locations do you serve?</Label>
          <Textarea
            id="locations"
            value={businessInfoAnswers.locations}
            onChange={(e) => setBusinessInfoAnswers({ ...businessInfoAnswers, locations: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excludedLocations">Are there any locations in your area you DO NOT serve?</Label>
          <Textarea
            id="excludedLocations"
            value={businessInfoAnswers.excludedLocations}
            onChange={(e) => setBusinessInfoAnswers({ ...businessInfoAnswers, excludedLocations: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priorityService">What service do you want to sell the most?</Label>
          <Textarea
            id="priorityService"
            value={businessInfoAnswers.priorityService}
            onChange={(e) => setBusinessInfoAnswers({ ...businessInfoAnswers, priorityService: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">What is your business phone number?</Label>
          <Input
            id="phoneNumber"
            value={businessInfoAnswers.phoneNumber}
            onChange={(e) => setBusinessInfoAnswers({ ...businessInfoAnswers, phoneNumber: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">What is your business address?</Label>
          <Textarea
            id="address"
            value={businessInfoAnswers.address}
            onChange={(e) => setBusinessInfoAnswers({ ...businessInfoAnswers, address: e.target.value })}
            required
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Saving...' : 'Save Asset'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving...' : 'Save Asset'}
        </Button>
      </div>
    </form>
  );
};
