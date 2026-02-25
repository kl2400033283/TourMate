import { AlertCircle } from 'lucide-react';

export function PlaceholderBlock({ type, ...props }) {
  return (
    <div className="m-4 rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-headline font-semibold">Unknown Component</h3>
      </div>
      <p className="mt-2 text-sm text-destructive/80">
        Component type <code className="rounded bg-destructive/20 px-1 py-0.5 font-mono text-xs">{type}</code> is not yet supported.
      </p>
      <details className="mt-2 text-xs">
        <summary>View Props</summary>
        <pre className="mt-1 rounded bg-black/70 p-2 text-white text-xs overflow-auto">
            {JSON.stringify(props, null, 2)}
        </pre>
      </details>
    </div>
  );
}
