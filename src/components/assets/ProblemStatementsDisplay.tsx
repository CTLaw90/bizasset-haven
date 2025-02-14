
import { Card, CardContent } from "@/components/ui/card";

interface ProblemStatementsDisplayProps {
  statements: string[] | string;
}

export const ProblemStatementsDisplay = ({ statements }: ProblemStatementsDisplayProps) => {
  const parseStatements = () => {
    if (typeof statements === 'string') {
      try {
        // Parse JSON string if needed
        const parsed = JSON.parse(statements);
        return Array.isArray(parsed) ? parsed : null;
      } catch (e) {
        console.error('Error parsing problem statements:', e);
        return null;
      }
    }
    return statements;
  };

  const parsedStatements = parseStatements();

  if (!parsedStatements || !Array.isArray(parsedStatements)) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            No problem statements available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {parsedStatements.map((statement, index) => (
        <Card key={index} className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-base whitespace-pre-wrap">
              {index + 1}. {statement}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
