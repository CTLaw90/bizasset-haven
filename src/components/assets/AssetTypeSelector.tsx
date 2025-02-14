
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AssetTypeSelectorProps {
  onSelect: (type: 'brandscript' | 'business_info' | 'customer_personas' | 'problem_statements') => void;
}

export const AssetTypeSelector = ({ onSelect }: AssetTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card 
        className="cursor-pointer hover:bg-accent transition-colors"
        onClick={() => onSelect('brandscript')}
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
        onClick={() => onSelect('business_info')}
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
        onClick={() => onSelect('customer_personas')}
      >
        <CardHeader className="text-center">
          <CardTitle>Customer Personas</CardTitle>
          <CardDescription className="line-clamp-2">
            Generate detailed customer personas
          </CardDescription>
        </CardHeader>
      </Card>
      <Card 
        className="cursor-pointer hover:bg-accent transition-colors"
        onClick={() => onSelect('problem_statements')}
      >
        <CardHeader className="text-center">
          <CardTitle>Problem Statements</CardTitle>
          <CardDescription className="line-clamp-2">
            Generate problem statements based on brandscript and personas
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
