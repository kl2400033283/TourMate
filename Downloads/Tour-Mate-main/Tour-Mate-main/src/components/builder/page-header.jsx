import { Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Feather className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          Genesis Canvas
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Preview
        </Button>
        <Button size="sm">Publish</Button>
      </div>
    </header>
  );
}
