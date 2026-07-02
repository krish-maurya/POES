import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
          <Construction className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-medium">{title} module coming next</div>
          <div className="mt-1 max-w-md text-sm text-muted-foreground">
            {description ??
              "The foundation is in place. This module will be redesigned and wired to the backend in the next iteration."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
