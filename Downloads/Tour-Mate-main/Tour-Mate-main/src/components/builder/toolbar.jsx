'use client';
import { useBuilder } from '@/hooks/use-builder';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone, Trash2 } from 'lucide-react';

export function BuilderToolbar() {
  const { previewMode, setPreviewMode, setElements } = useBuilder();

  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setElements([]);
    }
  };
  
  const modes = [
    { name: 'desktop', icon: Monitor },
    { name: 'tablet', icon: Tablet },
    { name: 'mobile', icon: Smartphone },
  ];

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
      <div></div>
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        {modes.map(mode => (
          <Button
            key={mode.name}
            variant={previewMode === mode.name ? 'background' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setPreviewMode(mode.name)}
            aria-label={`Switch to ${mode.name} view`}
          >
            <mode.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <div>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearCanvas}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Clear canvas"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
