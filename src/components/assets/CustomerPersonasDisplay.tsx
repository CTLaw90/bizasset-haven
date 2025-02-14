
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CustomerPersonasDisplayProps {
  personas: string;
}

export const CustomerPersonasDisplay = ({ personas }: CustomerPersonasDisplayProps) => {
  return (
    <div className="space-y-4">
      {personas.split('### Persona').filter(Boolean).map((persona, index) => {
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
  );
};
