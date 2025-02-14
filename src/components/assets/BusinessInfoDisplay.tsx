
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BusinessInfoAnswers } from "@/types/assets";

interface BusinessInfoDisplayProps {
  answers: BusinessInfoAnswers;
}

export const BusinessInfoDisplay = ({ answers }: BusinessInfoDisplayProps) => {
  return (
    <div className="grid gap-4">
      {Object.entries(answers).map(([key, value]) => (
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
  );
};
