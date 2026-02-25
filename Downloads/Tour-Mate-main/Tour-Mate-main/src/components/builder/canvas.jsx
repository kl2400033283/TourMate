'use client';
import { useBuilder } from '@/hooks/use-builder';
import { ElementRenderer } from './element-renderer';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Feather } from 'lucide-react';

export function BuilderCanvas() {
  const { elements, previewMode } = useBuilder();

  const previewWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="flex-1 bg-muted/30 p-4 md:p-8 overflow-auto">
      <ScrollArea className="h-full w-full">
        <div
          className={cn(
            'mx-auto h-full min-h-[calc(100vh-14rem)] w-full bg-white shadow-lg transition-all duration-300 ease-in-out dark:bg-card',
            'rounded-lg'
          )}
          style={{ maxWidth: previewWidths[previewMode] }}
        >
          {elements.length > 0 ? (
            elements.map(element => (
              <ElementRenderer key={element.id} element={element} />
            ))
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground p-8">
              <Feather className="h-12 w-12 mb-4 text-primary/50" />
              <h2 className="font-headline text-2xl font-semibold mb-2">
                Your Canvas is Blank
              </h2>
              <p className="max-w-md text-sm">
                Start building your masterpiece! Add components from the{' '}
                <span className="font-semibold text-foreground">Components</span> panel, or
                let our{' '}
                <span className="font-semibold text-foreground">AI Designer</span> create a
                starting point for you.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
