
import { Card, CardContent } from "@/components/ui/card";

interface BrandscriptDisplayProps {
  content: string;
}

export const BrandscriptDisplay = ({ content }: BrandscriptDisplayProps) => {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6">
        <pre className="whitespace-pre-wrap text-sm font-mono">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
};
