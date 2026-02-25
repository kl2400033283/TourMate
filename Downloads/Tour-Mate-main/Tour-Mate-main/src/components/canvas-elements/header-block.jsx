import { cn } from '@/lib/utils';

export function HeaderBlock({ text, isHero = false }) {
  return (
    <header
      className={cn(
        'p-8 md:p-16 text-center',
        isHero
          ? 'bg-primary/20'
          : 'bg-muted/30'
      )}
    >
      <h1
        className={cn(
          'font-headline font-bold',
          isHero
            ? 'text-4xl md:text-6xl tracking-tighter'
            : 'text-3xl md:text-4xl tracking-tight'
        )}
      >
        {text}
      </h1>
    </header>
  );
}
