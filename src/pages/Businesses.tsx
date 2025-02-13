
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

export const Businesses = () => {
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
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Sample Business {i}</CardTitle>
              <CardDescription>Created 2 days ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
